export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    return date
  } catch (e) {
    console.error(e)
    return "Invalid date";
  }
};
