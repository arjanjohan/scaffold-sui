"use client";

import { NextPage } from "next";

const DocsPage: NextPage = () => {
  return (
    <div className="w-full h-screen">
      <iframe src="https://scaffold-iota-docs.vercel.app" className="w-full h-full" />
    </div>
  );
};

export default DocsPage;
