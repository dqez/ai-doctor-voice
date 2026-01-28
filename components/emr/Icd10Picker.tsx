"use client";

import React, { useState } from "react";
import { Search, X, Tag } from "lucide-react";

interface Icd10Code {
  code: string;
  description: string;
}

// Mock Data for demo purposes
const MOCK_ICD10_DB: Icd10Code[] = [
  { code: "J00", description: "Acute nasopharyngitis [common cold]" },
  { code: "J01.90", description: "Acute sinusitis, unspecified" },
  { code: "J02.9", description: "Acute pharyngitis, unspecified" },
  {
    code: "J06.9",
    description: "Acute upper respiratory infection, unspecified",
  },
  { code: "A09", description: "Infectious gastroenteritis" },
  { code: "R50.9", description: "Fever, unspecified" },
  { code: "R05", description: "Cough" },
];

interface Icd10PickerProps {
  selectedCodes: Icd10Code[];
  onSelectionChange: (codes: Icd10Code[]) => void;
  maxSelection?: number;
}

export const Icd10Picker: React.FC<Icd10PickerProps> = ({
  selectedCodes,
  onSelectionChange,
  maxSelection = 10,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Icd10Code[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const filtered = MOCK_ICD10_DB.filter(
      (item) =>
        item.code.toLowerCase().includes(text.toLowerCase()) ||
        item.description.toLowerCase().includes(text.toLowerCase()),
    );
    setResults(filtered);
    setShowResults(true);
  };

  const handleSelect = (code: Icd10Code) => {
    if (selectedCodes.find((c) => c.code === code.code)) return; // Already selected
    if (selectedCodes.length >= maxSelection) return;

    onSelectionChange([...selectedCodes, code]);
    setQuery("");
    setShowResults(false);
  };

  const handleRemove = (codeToRemove: string) => {
    onSelectionChange(selectedCodes.filter((c) => c.code !== codeToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700 font-display">
          ICD-10 Diagnosis ({selectedCodes.length}/{maxSelection})
        </label>
      </div>

      {/* Selected Chips */}
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {selectedCodes.length === 0 && (
          <span className="text-sm text-gray-400 italic py-2">
            No codes selected
          </span>
        )}
        {selectedCodes.map((code) => (
          <div
            key={code.code}
            className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 text-sm font-medium animate-in fade-in zoom-in duration-200"
          >
            <span className="font-bold">{code.code}</span>
            <span className="max-w-[200px] truncate">{code.description}</span>
            <button
              onClick={() => handleRemove(code.code)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
          placeholder="Search ICD-10 code or description (e.g. J00)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={selectedCodes.length >= maxSelection}
        />

        {/* Dropdown Results */}
        {showResults && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-[300px] overflow-auto">
            {results.map((result) => (
              <button
                key={result.code}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                onClick={() => handleSelect(result)}
              >
                <Tag className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="font-bold text-gray-900 mr-2">
                    {result.code}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {result.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
