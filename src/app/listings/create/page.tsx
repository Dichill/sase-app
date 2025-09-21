"use client";

import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

const CreateListing = () => {
  return (
    <div>
      <div>listing</div>
    </div>
  );
};

export default CreateListing;
