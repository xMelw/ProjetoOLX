const { get } = require('../database');

async function getDashboardStats() {
  const users = await get("SELECT COUNT(*) total,SUM(status='banned') banned FROM users");
  const ads = await get("SELECT COUNT(*) total,SUM(status='active') active,SUM(status='pending') pending,SUM(views) views FROM ads");
  const today = await get("SELECT COUNT(*) total FROM recent_views WHERE date(viewed_at)=date('now','localtime')");
  return { totalUsers: users.total, totalAds: ads.total, totalViews: ads.views || 0, totalRevenue: 0, activeAds: ads.active || 0, pendingAds: ads.pending || 0, bannedUsers: users.banned || 0, todayViews: today.total || 0 };
}
module.exports = { getDashboardStats };