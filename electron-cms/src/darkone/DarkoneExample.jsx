import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
// PageTitle and Spinner are commented out since Darkone should only be used as reference
// import { PageTitle, Spinner } from './index';

/**
 * Example component showing Darkone UI concepts
 * NOTE: This is a placeholder component only. Darkone components are for reference only.
 */
const DarkoneExample = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Darkone UI Reference</h2>
          <p>
            Darkone is available as a reference UI kit only. Components should not be directly imported.
          </p>
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <h4 className="card-title">Spinner Example</h4>
              <p className="card-text">Example of a spinner component concept</p>
              <div className="text-center">
                {/* Spinner placeholder */}
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <h4 className="card-title">Bootstrap Card</h4>
              <p className="card-text">Example of Bootstrap card</p>
              <div className="alert alert-info">
                Darkone provides reference implementations that can be studied and recreated in your own components
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DarkoneExample; 