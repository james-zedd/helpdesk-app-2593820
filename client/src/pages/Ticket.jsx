import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getTicket,
    closeTicket,
    assignTicketToStaff,
    reset,
} from '../features/tickets/ticketSlice';
import {
    getNotes,
    createNote,
    reset as notesReset,
} from '../features/notes/noteSlice';
import { getAllStaff } from '../features/auth/authSlice';
import { BackButton } from '../components/BackButton';
import Spinner from '../components/Spinner';
import NoteItem from '../components/NoteItem';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

const customStyles = {
    content: {
        width: '600px',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        position: 'relative',
    },
};

Modal.setAppElement('#root');

function Ticket() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [showAssignTicektForm, setShowAssignTicketForm] = useState(false);
    const [staffMember, setStaffMember] = useState('');

    const { ticket, isLoading, isSuccess, isError, message } = useSelector(
        (state) => state.tickets
    );

    const { notes, isLoading: notesIsLoading } = useSelector(
        (state) => state.notes
    );

    const { user } = useSelector((state) => state.auth);

    const { staffUsers } = useSelector((state) => state.auth);

    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { ticketId } = useParams();

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        dispatch(getTicket(ticketId));
        dispatch(getNotes(ticketId));
        if (user.isManager) {
            dispatch(getAllStaff(user.token));
        }
    }, [isError, message, ticketId, user, dispatch]);

    const onTicketClose = () => {
        if (window.confirm('Do you really want to close this ticket')) {
            dispatch(closeTicket(ticketId));
            toast.success('Ticket closed');
            navigate('/tickets');
        } else {
            toast.error('Ticket not closed');
        }
    };

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    const onNoteSubmit = (e) => {
        e.preventDefault();
        dispatch(createNote({ noteText, ticketId }));
        closeModal();
    };

    const onAssignTicket = (e) => {
        e.preventDefault();

        if (staffMember == '') {
            console.log('no staff chosen');
            toast.error(
                'Please choose a staff member to assign the ticket to.'
            );
            return;
        }

        dispatch(assignTicketToStaff({ ticketId, staffMember }));
    };

    if (isLoading || notesIsLoading) {
        return <Spinner />;
    }

    if (isError) {
        return (
            <>
                <h3>Something went wrong (error)</h3>
                <p>{message}</p>
            </>
        );
    }

    return (
        <div className='ticket-page'>
            <header className='ticket-header'>
                <BackButton url='/tickets' />
                <h2>
                    Ticket ID: {ticket._id}
                    <span className={`status status-${ticket.status}`}>
                        {ticket.status}
                    </span>
                </h2>
                <h3>
                    Date Submitted:{' '}
                    {new Date(ticket.createdAt).toLocaleString('en-US')}
                </h3>
                <h3>Product: {ticket.product}</h3>
                {ticket.isAssigned && (
                    <h3>Assigned To: {ticket.assignedTo.name}</h3>
                )}
                <hr />
                <div className='ticket-desc'>
                    <h3>Description of issue</h3>
                    <p>{ticket.description}</p>
                </div>
                <div className='assign-ticket'>
                    {user.isManager & !ticket.isAssigned ? (
                        <form onSubmit={onAssignTicket}>
                            <label htmlFor='findStaff'>
                                Choose Staff to assign ticket to:
                            </label>
                            <select
                                name='findStaff'
                                id='findStaff'
                                onChange={(e) => setStaffMember(e.target.value)}
                            >
                                <option selected disabled>
                                    Choose a staff member
                                </option>
                                {staffUsers.map((staff) => (
                                    <option key={staff._id} value={staff._id}>
                                        {staff.name}
                                    </option>
                                ))}
                            </select>
                            <button className='btn' type='submit'>
                                Assign
                            </button>
                        </form>
                    ) : (
                        ''
                    )}
                </div>
                <h2>Notes</h2>
            </header>

            {ticket.status !== 'closed' && (
                <button className='btn' onClick={openModal}>
                    <FaPlus />
                    Add note
                </button>
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel='Add note'
            >
                <h2>Add Note</h2>
                <button className='btn-close' onClick={closeModal}>
                    X
                </button>
                <form onSubmit={onNoteSubmit}>
                    <div className='form-group'>
                        <textarea
                            name='noteText'
                            id='noteText'
                            className='form-control'
                            placeholder='Note Text'
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                        ></textarea>
                    </div>
                    <div className='form-group'>
                        <button className='btn' type='submit'>
                            Submit
                        </button>
                    </div>
                </form>
            </Modal>

            {notes.map((note) => (
                <NoteItem key={note._id} note={note} />
            ))}

            {ticket.status !== 'closed' && (
                <button
                    className='btn btn-block btn-danger'
                    onClick={onTicketClose}
                >
                    Close Ticket
                </button>
            )}
        </div>
    );
}

export default Ticket;
