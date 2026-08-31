/**
 * Middleware d'autorisation par rôle administratif.
 * req.userRole : 'client' | 'admin' (rôle global, défini par authMiddleware)
 * Rôles métier (admin_role) : superadmin | compliance | finance | support
 *
 * Lecture (excludeWrite) : parcours de contrôle pour les rôles non-superadmin.
 * Seul le superadmin (ou admin sans restriction) peut écrire.
 */
export function requireAdminScope(allowed = []) {
  return async (req, res, next) => {
    // Doit déjà être passé par adminMiddleware (role === 'admin')
    try {
      const { pool } = await import('../config/database.js');
      const r = await pool.query(`SELECT admin_role FROM users WHERE id = $1`, [req.userId]);
      if (r.rowCount === 0) return res.status(403).json({ error: 'Utilisateur introuvable' });
      const adminRole = r.rows[0].admin_role || 'superadmin';

      req.adminRole = adminRole;

      if (adminRole === 'superadmin') return next();
      if (allowed.includes(adminRole)) return next();
      return res.status(403).json({ error: 'Rôle insuffisant pour cette action' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  };
}
