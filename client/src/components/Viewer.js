import React from 'react'
import image1 from './assets/images/record.jpg'
import image3 from './assets/images/add.jpg';

const records = ['record1'];
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
        <div className='recordblock'>
            {React.Children.toArray(
                records.map((r, i) => (
                    <div className='ProjectSectionBlock'>
                        <div className='RoomComponentList ViewerComponentList' key={i}>
                            <img className='round' src={image1} width='50' height='50' alt=' UserImage '></img>
                              <span>
                                {r}
                              </span> 
                       </div>
                    </div>
                )))}
            <div className='RoomComponentList RoomComponentListAddImg'>
                <img src={image3} width='50' height='50' alt=' add icon '></img>
            </div>   
        </div>
    );
  }
}

export default Viewer;