import React from 'react';

const AiFeedbackDisplay = ({ responseString }) => {
  // Handles the initial state before any feedback is generated
  if (!responseString || responseString.includes("No feedback yet")) {
    return <p className="text-sm text-muted-foreground">{responseString}</p>;
  }

  // Split the feedback string by new lines to style each part
  const feedbackParts = responseString.split('\n');

  return (
    <div className="space-y-2 text-sm">
      {feedbackParts.map((part, index) => {
        // Split each line into a title (like "Strengths") and the content
        const [title, ...rest] = part.split(':');
        const content = rest.join(':').trim();
        
        return (
          <div key={index}>
            <span className="font-semibold text-foreground">{title}:</span>
            <span className="text-muted-foreground"> {content}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AiFeedbackDisplay;