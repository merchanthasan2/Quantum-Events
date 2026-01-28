export function generateCalendarLink(event: {
    title: string;
    description: string;
    location: string;
    startDate: string;
    startTime?: string;
}) {
    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);

    // Format date for Google Calendar (YYYYMMDDTHHmmSSZ)
    const start = new Date(event.startDate);
    if (event.startTime) {
        const [hours, minutes] = event.startTime.split(':');
        start.setHours(parseInt(hours), parseInt(minutes));
    }

    const startDateStr = start.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
    const endDateStr = end.toISOString().replace(/-|:|\.\d\d\d/g, '');

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${startDateStr}/${endDateStr}`;
}
