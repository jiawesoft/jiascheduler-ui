const TOKEN_KEY = 'token';
const TEAM_ID_KEY = 'team_id';

const isLogin = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getTeamId = () => {
  const teamId = localStorage.getItem(TEAM_ID_KEY);
  return (teamId && parseInt(teamId, 36)) || undefined;
};

const setTeamId = (teamId: string) => {
  localStorage.setItem(TEAM_ID_KEY, teamId);
};

export { isLogin, getToken, setToken, clearToken, getTeamId, setTeamId };
