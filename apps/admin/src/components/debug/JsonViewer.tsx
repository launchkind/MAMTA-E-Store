import React from "react";

interface JsonViewerProps {
  data: any;
  className?: string;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, className = "" }) => {
  // Handle circular references and errors
  const safeStringify = (obj: any): string => {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular Reference]";
          }
          seen.add(value);
        }
        return value;
      },
      2
    );
  };

  const syntaxHighlight = (json: string): string => {
    try {
      json = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = "text-orange-400"; // number
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "text-blue-400 font-medium"; // key
            } else {
              cls = "text-green-400"; // string
            }
          } else if (/true|false/.test(match)) {
            cls = "text-purple-400"; // boolean
          } else if (/null/.test(match)) {
            cls = "text-gray-400"; // null
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
    } catch (error) {
      return json;
    }
  };

  try {
    const jsonString = safeStringify(data);
    const highlighted = syntaxHighlight(jsonString);
    const lines = highlighted.split("\n");

    return (
      <div
        className={`bg-slate-950 rounded-lg border border-slate-800 overflow-auto w-full ${className}`}
        style={{ maxHeight: "inherit" }}
      >
        <div className="flex min-w-max w-fit">
          {/* Line Numbers */}
          <div className="bg-slate-900 text-slate-500 text-xs font-mono py-4 px-3 select-none border-r border-slate-800 sticky left-0 z-10">
            {lines.map((_, index) => (
              <div key={index} className="leading-6 text-right min-w-[2.5rem]">
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code Content */}
          <pre className="text-xs text-white p-4 font-mono whitespace-pre">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div
        className={`bg-red-950 rounded-lg border border-red-500 p-4 ${className}`}
      >
        <p className="text-red-300 text-xs font-mono">
          Error rendering JSON:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <pre className="text-red-200 text-xs mt-2">{String(data)}</pre>
      </div>
    );
  }
};

export default JsonViewer;
