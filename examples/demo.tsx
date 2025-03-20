import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  newmanGeTrequestQueryOptions,
  newmanGeTrequestQueryKeys,
} from "./generated/newman:ge-trequest/query";

const DemoCodegen = () => {
  const query = useQuery({
    ...newmanGeTrequestQueryOptions({
      source: "test",
    }),
  });
  const queryKeys = newmanGeTrequestQueryKeys({ source: "test" });
  console.log("Data response", query);
  console.log("Query keys", queryKeys);
  return <div>DemoCodegen</div>;
};

export default DemoCodegen;
