import react from 'react';
import './Home.css';

function Home() {
    return (
        <>
            <div className="main">
                <div className="left">
                    <p>User List from same Lobby</p>
                </div>
                <div className="middle">

                    <div className='middle_main'>
                        <div className="middle_list">Array of messages from current lobby</div>
                        <div className="middle_message">
                            <textarea id="message" name="message" rows="4" cols="50">
                            </textarea>
                            <button id="btn_send" >Send</button>

                        </div>
                    </div>
                </div>
                <div className="right">
                    <p> Logged In User Details</p>
                </div>

            </div>
        </>
    )
}
export default Home;