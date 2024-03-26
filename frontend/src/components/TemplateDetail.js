/* eslint-disable */
// TemplateDetail.js

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AddStepForm from './AddStepForm'; // Import the AddStepForm

const TemplateDetail = () => {
  const { templateId } = useParams();
  const [steps, setSteps] = useState([]);
  const [showAddStepForm, setShowAddStepForm] = useState(false);

  const handleAddStep = (newStep) => {
    // Logic to handle adding a new step
    // Update the state or make an API call to add the new step
    setSteps((prevSteps) => [...prevSteps, newStep]);
    setShowAddStepForm(false);
  };

  const handleCloseAddStepForm = () => {
    setShowAddStepForm(false);
  };

  return (
    <div>
      <h2>Template Detail</h2>
      <p>Template ID: {templateId}</p>
      {/* Display details about the template if needed */}
      <button onClick={() => setShowAddStepForm(true)}>Add Step</button>
      {showAddStepForm && (
        <AddStepForm handleAddStep={handleAddStep} handleCloseForm={handleCloseAddStepForm} />
      )}
      <h3>Steps</h3>
      <ul>
        {/* Display the list of steps */}
        {steps.map((step, index) => (
          <li key={index}>
            <Link to={`/procedure/${templateId}/${step.id}`}>
              {step.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemplateDetail;