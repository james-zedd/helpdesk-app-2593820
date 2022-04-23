import axios from 'axios';

const API_URL = '/api/tickets/';

// create new ticket
const createTicket = async (ticketData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(API_URL, ticketData, config);

    return response.data;
};

// get all tickets
const getTickets = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(API_URL, config);

    return response.data;
};

// get single ticket
const getTicket = async (ticketId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(API_URL + ticketId, config);

    return response.data;
};

// closeticket
const closeTicket = async (ticketId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.put(
        API_URL + ticketId,
        { status: 'closed' },
        config
    );

    return response.data;
};

// assign ticket to staff
const assignTicketToStaff = async (token, ticketId, staffId) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const body = {
        ticketId: ticketId,
        staffId: staffId,
    };

    const response = await axios.post(API_URL + 'manager/assign', body, config);

    return response.data;
};

const ticketService = {
    createTicket,
    getTickets,
    getTicket,
    closeTicket,
    assignTicketToStaff,
};

export default ticketService;
