/** Salutation française + nom affiché pour l'espace client */
export function getClientGreeting(userProfile) {
  const hour = new Date().getHours();
  const salut = hour >= 6 && hour < 18 ? 'Bonjour' : 'Bonsoir';
  const name =
    userProfile?.displayName?.trim() ||
    [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ').trim() ||
    '';
  return { salut, name: name || 'bienvenue' };
}
