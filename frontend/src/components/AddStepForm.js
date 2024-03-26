/* eslint-disable */
// AddStepForm.js

import React, { useState } from 'react';

const AddStepForm = ({ handleAddStep, handleCloseForm }) => {
  const [stepName, setStepName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (stepName.trim() === '') {
      // Handle validation or show an error message
      return;
    }

    // Create a new step object
    const newStep = {
      id: new Date().toISOString(), // You can use a more robust ID generation method
      name: stepName,
    };

    // Pass the new step to the parent component
    handleAddStep(newStep);

    // Reset the form
    setStepName('');

    // Close the form
    handleCloseForm();
  };

  return (
    <div>
      <h3>Add Step</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="stepName">Step Name:</label>
        <input
          type="text"
          id="stepName"
          name="stepName"
          value={stepName}
          onChange={(e) => setStepName(e.target.value)}
          required
        />
        <button type="submit">Add Step</button>
      </form>
      <button onClick={handleCloseForm}>Cancel</button>
    </div>
  );
};

export default AddStepForm;