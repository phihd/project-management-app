/* eslint-disable */
// StepDetail.js

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const StepDetail = () => {
  const { templateId, stepId } = useParams();
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [supervisorReview, setSupervisorReview] = useState('');

  // Function to handle submitting the step to the supervisor
  const handleSubmitStep = () => {
    // Logic to submit the step for supervisor review
    // You can update the state or make an API call here
    // Display a success message or redirect to the next step/page
  };

  return (
    <div>
      <h2>Step Detail</h2>
      <p>Template ID: {templateId}</p>
      <p>Step ID: {stepId}</p>
      {/* Display details about the step if needed */}
      <h3>Description</h3>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter step description..."
      ></textarea>
      <h3>Requirements</h3>
      <ul>
        {/* Display checkboxes for requirements */}
        {/* Logic to handle requirements state */}
      </ul>
      <h3>Questions for Staff</h3>
      <ul>
        {/* Display questions for staff */}
        {/* Logic to handle answers state */}
      </ul>
      <button onClick={handleSubmitStep}>Proceed to Next Step</button>
      <div>
        <h3>Supervisor Review</h3>
        <textarea
          value={supervisorReview}
          onChange={(e) => setSupervisorReview(e.target.value)}
          placeholder="Enter supervisor feedback..."
        ></textarea>
        <button>Accept</button>
        <button>Reject</button>
      </div>
    </div>
  );
};

export default StepDetail;
