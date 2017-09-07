module.exports = () => {
  function manager(target) {
    target.isEmeraldManager = true;
  }

  return {
    "manager": manager
  }
}