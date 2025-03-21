import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  newmanGetRequestQueryOptions,
  newmanGetRequestQueryKeys,
} from "./generated/newman-get-request/query";

const DemoCodegen = () => {
  const query = useQuery({
    ...newmanGetRequestQueryOptions({
      source: "test",
    }),
  });
  const queryKeys = newmanGetRequestQueryKeys({ source: "test" });
  console.log("Data response", query);
  console.log("Query keys", queryKeys);
  return <div>DemoCodegen</div>;
};

export default DemoCodegen;
