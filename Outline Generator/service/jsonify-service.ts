export const jsonifyService = (response: string) => {
  try {
    const regexJsonWrapped = /```json\n?([\s\S]*?)\n?```/;
    const matchJsonWrapped = response.match(regexJsonWrapped);
    if (matchJsonWrapped) {
      return JSON.parse(matchJsonWrapped[1]);
    }

    const regexCodeBlockWrapped = /```\n?([\s\S]*?)\n?```/;
    const matchCodeBlockWrapped = response.match(regexCodeBlockWrapped);
    if (matchCodeBlockWrapped) {
      return JSON.parse(matchCodeBlockWrapped[1]);
    }

    return JSON.parse(response);
  } catch (error) {
    console.error("Error parsing JSON", error);
    return "No valid JSON found";
  }
};