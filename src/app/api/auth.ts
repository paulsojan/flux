import axios from "./axios";

type AuthStatusResponse = { authenticated: boolean };

const status = () => axios.get("auth/status") as Promise<AuthStatusResponse>;

const authApi = { status };

export default authApi;
