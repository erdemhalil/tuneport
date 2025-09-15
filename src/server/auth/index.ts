import NextAuth from "next-auth";

import { authConfig } from "./config";

export default NextAuth(authConfig);
