function calculateGPA(results) {
  if (!results || results.length === 0) {
    return 0;
  }

  const totalPoints = results.reduce((total, result) => {
    return total + (Number(result.gradePoint) || 0);
  }, 0);

  return Number((totalPoints / results.length).toFixed(2));
}

module.exports = {
  calculateGPA,
};