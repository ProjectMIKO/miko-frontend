import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLink,
  faUnlink,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";

interface ControlPanelProps {
  newNodeLabel: string;
  newNodeContent: string;
  newNodeColor: string;
  setNewNodeLabel: (label: string) => void;
  setNewNodeContent: (content: string) => void;
  setNewNodeColor: (color: string) => void;
  handleKeyword: (id: any) => void;
  setAction: (action: string) => void;
  fitToScreen: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  newNodeLabel,
  newNodeContent,
  newNodeColor,
  setNewNodeLabel,
  setNewNodeContent,
  setNewNodeColor,
  handleKeyword,
  setAction,
  fitToScreen,
}) => {
  return (
    <div className="flex flex-row gap-5 p-2 justify-center items-center bg-white/80 rounded-lg border border-gray-300">
      <input
        type="text"
        placeholder="Node Label"
        value={newNodeLabel}
        onChange={(e) => setNewNodeLabel(e.target.value)}
        className="p-2 border border-gray-300 rounded-md text-lg"
      />
      <input
        type="text"
        placeholder="Node Content"
        value={newNodeContent}
        onChange={(e) => setNewNodeContent(e.target.value)}
        className="p-2 border border-gray-300 rounded-md text-lg"
      />

      <button
        onClick={handleKeyword}
        className="flex items-center justify-center min-w-[100px] h-10 text-white text-xs cursor-pointer transition duration-300 bg-indigo-400 hover:bg-indigo-600 rounded-md"
      >
        <FontAwesomeIcon icon={faPlus} className="w-5 h-5 mr-1" />
        키워드 추출
      </button>
      <button
        onClick={() => setAction("connect")}
        className="flex items-center justify-center min-w-[100px] h-10 text-white text-xs cursor-pointer transition duration-300 bg-indigo-400 hover:bg-indigo-600 rounded-md"
      >
        <FontAwesomeIcon icon={faLink} className="w-5 h-5 mr-1" />
        Connect
      </button>
      <button
        onClick={() => setAction("disconnect")}
        className="flex items-center justify-center min-w-[100px] h-10 text-white text-xs cursor-pointer transition duration-300 bg-indigo-400 hover:bg-indigo-600 rounded-md"
      >
        <FontAwesomeIcon icon={faUnlink} className="w-5 h-5 mr-1" />
        Disconnect
      </button>
      <button
        onClick={fitToScreen}
        className="flex items-center justify-center min-w-[100px] h-10 text-white text-xs cursor-pointer transition duration-300 bg-indigo-400 hover:bg-indigo-600 rounded-md"
      >
        <FontAwesomeIcon icon={faExpand} className="w-5 h-5 mr-1" />
        Fit to Screen
      </button>
    </div>
  );
};

export default ControlPanel;
