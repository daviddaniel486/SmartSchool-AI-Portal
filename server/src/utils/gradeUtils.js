function calculateGrade(score) {
  if (score >= 70) {
    return {
      grade: "A",
      point: 5,
      remark: "Excellent",
    };
  }

  if (score >= 60) {
    return {
      grade: "B",
      point: 4,
      remark: "Very Good",
    };
  }

  if (score >= 50) {
    return {
      grade: "C",
      point: 3,
      remark: "Good",
    };
  }

  if (score >= 45) {
    return {
      grade: "D",
      point: 2,
      remark: "Fair",
    };
  }

  if (score >= 40) {
    return {
      grade: "E",
      point: 1,
      remark: "Pass",
    };
  }

  return {
    grade: "F",
    point: 0,
    remark: "Fail",
  };
}

module.exports = {
  calculateGrade,
};