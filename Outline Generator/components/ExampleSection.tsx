"use client";

import React, { useState } from "react";
import ExampleCard from "@/components/ExampleCard";
import IconReact from "@/public/icons/logos_react_new.svg";
import IconGithub from "@/public/icons/github_logo_new.svg";
import IconTerraform from "@/public/icons/terraform_logo_new.svg";
import IconRedis from "@/public/icons/logos_redis_new.svg";
import ExampleModal from "./ExampleModal";
import { OutlineType } from "@/domain/outline";
import {
  exampleOutlineOne,
  exampleOutlineTwo,
  exampleOutlineThree,
  exampleOutlineFour,
} from "@/static-content/exampleOutlines";

const ExampleSection = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    topic: "",
    client: "",
    info: "",
    difficulty: "",
  });
  const [selectedOutline, setSelectedOutline] = useState<OutlineType>();

  const handleCardClick = (content: {
    topic: string;
    client: string;
    info: string;
    difficulty: string;
    outline: string;
  }) => {
    if (content.outline === "1") {
      setSelectedOutline(exampleOutlineOne);
    } else if (content.outline === "2") {
      setSelectedOutline(exampleOutlineTwo);
    } else if (content.outline === "3") {
      setSelectedOutline(exampleOutlineThree);
    } else if (content.outline === "4") {
      setSelectedOutline(exampleOutlineFour);
    }
    setModalContent(content);
    setModalOpen(true);
  };

  return (
    <div className="bg-white p-4  py-12 rounded-2xl flex flex-col gap-4 items-center shadow-md">
      <p className=" text-3xl font-semibold text-center">Check out some examples</p>
      <div className="flex flex-col md:flex-row gap-6 lg:gap-24 mt-4 flex-1 items-center w-full justify-center">
        <div className="flex flex-col gap-6 lg:gap-24">
          <ExampleCard
            handleCardClick={handleCardClick}
            Logo={IconReact}
            topic="Authentication in React.js Application"
            client="React.js"
            info="Authentication should be implemented using JWT tokens."
            difficulty="Intermediate"
            outline="1"
            color="#E4FF3C"
          />
          <ExampleCard
            handleCardClick={handleCardClick}
            Logo={IconGithub}
            topic="Backstage integration in Github"
            client="Github"
            info="User Backstage plugin for Github integration."
            difficulty="Intermediate"
            outline="2"
            color="#FF5C00"
          />
        </div>
        <div className="flex flex-col gap-6 lg:gap-24">
          <ExampleCard
            handleCardClick={handleCardClick}
            Logo={IconTerraform}
            topic="Terraform Variables: Guide to Dynamic Configurations"
            client="Terraform"
            info="react"
            difficulty="hard"
            outline="3"
            color="#05FF00"
          />
          <ExampleCard
            handleCardClick={handleCardClick}
            Logo={IconRedis}
            topic="Integrating redis in a node.js application"
            client="Redis"
            info="react"
            difficulty="hard"
            outline="4"
            color="#6C5BE7"
          />
        </div>
      </div>
      {modalOpen && selectedOutline && (
        <ExampleModal
          onClose={() => setModalOpen(false)}
          topic={modalContent.topic}
          client={modalContent.client}
          info={modalContent.info}
          difficulty={modalContent.difficulty}
          outline={selectedOutline}
        />
      )}
    </div>
  );
};

export default ExampleSection;
