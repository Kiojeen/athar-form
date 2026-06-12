import { Unauthenticated } from "convex/react";

import Page from "./page";

export default function SecuredPage() {
  return (
    <Unauthenticated>
      <Page />
    </Unauthenticated>
  );
}
