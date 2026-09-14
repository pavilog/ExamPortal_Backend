import { pool } from "../../database/pool";
import { NotFoundError } from "../../errors/AppError";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

export async function findOrganizationBySlug(
  slug: string,
): Promise<Organization> {
  const { rows } = await pool.query<Organization>(
    `SELECT id, name, slug, logo_url, is_active
     FROM organizations
     WHERE slug = $1`,
    [slug],
  );

  if (rows.length === 0) {
    throw new NotFoundError(`No coaching institute found for "${slug}"`);
  }
  if (!rows[0].is_active) {
    throw new NotFoundError("This coaching institute's account is inactive");
  }

  return rows[0];
}
