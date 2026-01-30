// const InstructionsPopUp = (props) => {
//   // if url contains /search or /chat, then it's a task
//   const isTask =
//     window.location.pathname.includes("/search") ||
//     window.location.pathname.includes("/chat");

//   return (
//     <div className="flex flex-col items-center justify-center bg-[#e3e3e3] py-12 px-16 h-fit rounded-xl max-w-lg mx-auto">
//       <div className="text-black text-lg ">
//         <span className="font-bold">Instructions </span>
//         <span>{"("}</span>
//         <span className="text-md text-red-500">read carefully!</span>
//         <span>{")"}</span>
//       </div>
//       <p className="text-black mb-4">{props.instructionText}</p>
//       {isTask && (
//         <p className="font-bold">
//           We will evaluate participants’ performance based on the quality and
//           comprehensiveness of the submitted responses (on the right)
//         </p>
//       )}
//       <div className="flex space-x-4 mt-4">
//         <button
//           className="bg-white text-black px-6 py-2 rounded-lg"
//           onClick={() => props.setShowInstructions(false)}
//         >
//           Okay
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InstructionsPopUp;

import React from "react";

const InstructionsPopUp = ({ instructionText, setShowInstructions }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Instructions</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-700 leading-relaxed">{instructionText}</p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowInstructions(false)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Got it, let's start
        </button>
      </div>
    </div>
  );
};

export default InstructionsPopUp;
