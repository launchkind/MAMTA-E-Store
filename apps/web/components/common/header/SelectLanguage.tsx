"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import React, { useState } from "react";
import Image from "next/image";

const SelectLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("EN");

  const languages = [
    { code: "EN", name: "English", flag: "🇺🇸" },
  ];

  return (
    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
      <SelectTrigger className="border-none bg-transparent focus:ring-0 focus:outline-none shadow-none flex items-center justify-between gap-1 px-2 py-1 data-[size=default]:h-6 dark:bg-transparent dark:hover:transparent w-auto min-w-[70px]">
        <SelectValue placeholder="Language">
          <span className="flex items-center gap-1">
            <span className="text-base leading-none">🇺🇸</span>
            <span className="text-sm font-medium">{selectedLanguage}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          <SelectLabel>Language</SelectLabel>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectLanguage;
