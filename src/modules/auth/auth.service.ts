import { pool } from "../../database/pool";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import { ConflictError, UnauthorizedError } from "../../errors/AppError";
import { RegisterOrgInput, LoginInput } from "../../validators/auth.validators";

interface UserRow {
  id: string;
  organization_id: string | null;
  name: string;
  email: string;
  password_hash: string;
  role: "super_admin" | "coaching_admin" | "teacher" | "student";
}

export async function registerOrganization(input: RegisterOrgInput) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT 1 FROM organizations WHERE slug = $1",
      [input.slug],
    );
    if (existing.rows.length > 0) {
      throw new ConflictError(
        `Slug "${input.slug}" is already taken. Try a different one.`,
      );
    }

    const orgResult = await client.query(
      `INSERT INTO organizations (name, slug)
       VALUES ($1, $2)
       RETURNING id, name, slug`,
      [input.organizationName, input.slug],
    );
    const organization = orgResult.rows[0];

    const passwordHash = await hashPassword(input.password);

    const userResult = await client.query<UserRow>(
      `INSERT INTO users (organization_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'coaching_admin')
       RETURNING id, organization_id, name, email, role`,
      [organization.id, input.adminName, input.email, passwordHash],
    );
    const admin = userResult.rows[0];

    await client.query("COMMIT");

    const accessToken = signAccessToken({
      userId: admin.id,
      organizationId: admin.organization_id,
      role: admin.role,
    });

    return { organization, user: admin, accessToken };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function loginToTenant(input: LoginInput, organizationId: string) {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, organization_id, name, email, password_hash, role
     FROM users
     WHERE email = $1 AND organization_id = $2 AND is_active = TRUE`,
    [input.email, organizationId],
  );

  if (rows.length === 0) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const user = rows[0];
  const validPassword = await comparePassword(
    input.password,
    user.password_hash,
  );

  if (!validPassword) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const accessToken = signAccessToken({
    userId: user.id,
    organizationId: user.organization_id,
    role: user.role,
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  };
}
