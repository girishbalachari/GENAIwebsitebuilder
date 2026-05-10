export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user || null,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(200).json({ user: null });
  }
};
