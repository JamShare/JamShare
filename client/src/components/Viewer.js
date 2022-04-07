import React, { useEffect, useState, useRef } from 'react';

   
class Viewer extends React.Component {
        constructor(props) {
            super(props);
    
            this.state = {
                isRecording: false, //if true, display new audio item in list
                isDownloading: false, //if true, animate or highlight incoming stream list item
            };
        
            this.files = [];
            

        }

    
    
    
    render() {
        return (
            <div id="container" >

            </div>
        );
    }
}

export default Viewer;