import React from "react";
import { Card, Button } from "react-bootstrap";

const HomeComponent = () => {
  return (
    <div className="home-component">
      <h2 className="text-center home-title">
        Welcome to Your Surveillance System
      </h2>

      <div className="d-flex flex-wrap justify-content-center">
        {/* Dashboard Card for Live Feed */}
        <Card style={{ width: "18rem" }} className="m-2">
          <Card.Img variant="top" src="/images/live-feed.jpg" />{" "}
          {/* Placeholder image */}
          <Card.Body>
            <Card.Title>Live Camera Feed</Card.Title>
            <Card.Text>Watch real-time video from your cameras.</Card.Text>
            <Button variant="primary" href="/livefeed">
              Go to Live Feed
            </Button>
          </Card.Body>
        </Card>

        {/* Dashboard Card for Camera Detection */}
        <Card style={{ width: "18rem" }} className="m-2">
          <Card.Img variant="top" src="/images/camera-detect.jpg" />{" "}
          {/* Placeholder image */}
          <Card.Body>
            <Card.Title>Camera Detected Clips</Card.Title>
            <Card.Text>
              Review the recordings triggered by camera detection.
            </Card.Text>
            <Button variant="primary" href="/cameradetect">
              View Clips
            </Button>
          </Card.Body>
        </Card>

        {/* Dashboard Card for Settings */}
        <Card style={{ width: "18rem" }} className="m-2">
          <Card.Img variant="top" src="/images/settings.jpg" />{" "}
          {/* Placeholder image */}
          <Card.Body>
            <Card.Title>Settings</Card.Title>
            <Card.Text>Adjust your system settings and preferences.</Card.Text>
            <Button variant="primary" href="/settings">
              Go to Settings
            </Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default HomeComponent;
