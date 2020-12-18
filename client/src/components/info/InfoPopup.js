import React from 'react';

import { ReactComponent as CloseIcon } from '../icons/close.svg';

const COLOURS = {
  HIGH: '#F9874E',
  NORMAL: '#FAC758',
  LOW: '#8CC788'
};

const InfoPopup = ({ minimize }) => {
  return (
    <div
      className="fixed z-50 inset-0 lg:inset-4 lg:bottom-10 lg:rounded bg-gray-900 border-white border-2 border-opacity-5 shadow-md text-white overflow-hidden"
    >
      <button
        className="absolute z-50 top-2 lg:top-4 right-2 lg:right-4 w-10 h-10 p-2 bg-gray-900 text-white rounded-full hover-hover:hover:bg-blue-900"
        onClick={minimize}>
        <CloseIcon />
      </button>
      <div className="relative w-full h-full overflow-y-auto flex justify-center">
        <main className="w-full lg:w-1/2 p-4 pt-12 text-xs">
          <h1 className="text-lg font-bold pb-2">TTCongestion</h1>
          <section className="pb-4">
          <h4 className="font-bold pt-2 pb-2">Introduction</h4>
            <p className="pb-2">
              <strong>TTCongestion</strong> is a visualization of road traffic based on TTC vehicle prediction data. The application observes changes in TTC vehicle
              prediction data over time and transform the changes into traffic data, which are then displayed on a map. The computed data can be good indicators of
              the road traffic along the TTC routes.
            </p>
            <p className="pb-2">
              For more details on the techincal implementations and future considerations, please check out Github repository for TTCongestion.
            </p>
            <p className="pb-2">
              <a
                href="https://github.com/tonywchen/toronto-traffic"
                target="_blank"
                rel="noreferrer"
                className="border-b border-dotted hover-hover:hover:bg-blue-500"
              >
                TTCongestion Github
              </a>
            </p>
          </section>
          <section className="pb-4">
            <h4 className=" font-bold pb-2">Visualization</h4>
            <p className="pb-2">
              The <strong>main map</strong> visualizes a snapshot of all traffic data at a specific date/time, which can be controlled using the timeline controls below the map.
            </p>
            <p className="pb-2">
              The visualization graphs each traffic data as a line between its start/end stops. Each line is also coloured in as follows:
            </p>
            <div className="w-full flex items-center space-x-2 font-bold py-2">
              <div className="w-1/3">
                <div className={`w-full border-t-4 pb-2`} style={{borderColor: COLOURS.HIGH}}></div>
                <div style={{color: COLOURS.HIGH}}>Congested</div>
              </div>
              <div className="w-1/3">
                <div className={`w-full border-t-4 pb-2`} style={{borderColor: COLOURS.NORMAL}}></div>
                <div style={{color: COLOURS.NORMAL}}>Normal</div>
              </div>
              <div className="w-1/3">
                <div className={`w-full border-t-4 pb-2`} style={{borderColor: COLOURS.LOW}}></div>
                <div style={{color: COLOURS.LOW}}>Light</div>
              </div>
            </div>
          </section>
          <section className="pb-4">
            <h4 className="font-bold pb-2">Data Definition</h4>
            <p className="pb-2">
              Each traffic data consists of the following information:
            </p>
            <ul className="pb-2">
              <li className="pl-2 py-1">
                <strong>Start/End Stops</strong>
                <br/>
                A start and end points, which map to a vehicle's preceding stop and current/upcoming stop
              </li>
              <li className="pl-2 py-1">
                <strong>Date/Time</strong>
                <br/>
                The beginning of the 5-minute interval the traffic data base its predictions from
              </li>
              <li className="pl-2 py-1">
                <strong>Congestion Level</strong>
                <br/>
                The average of number of seconds of how much all vehicles are ahead/behind compared to the preceding predictions
              </li>
            </ul>
          </section>
          <section className="pb-4">
            <h4 className="font-bold pb-2">Limitations</h4>
            <p className="pb-2">
              This visualization is still a proof-of-concept, and is limited to show only <strong>one route - 504 King</strong> at the moment. The routing data between stops might
              also not match perfectly to real TTC vehicle route - especially evident around terminal stations or sharp corners - due to the limitation of the routing API.
            </p>
          </section>
          <section className="pb-4">
            <h4 className="font-bold pb-2">Tech Stack</h4>
            <p className="pb-2">
              The project is built with:
            </p>
            <ul className="pb-2">
              <li className="pl-2 py-1"><strong>MongoDB</strong> for database</li>
              <li className="pl-2 py-1"><strong>NodeJS</strong>/<strong>Express</strong>/<strong>Mongoose</strong> for backend server</li>
              <li className="pl-2 py-1"><strong>ReactJS</strong>/<strong>Tailwind CSS</strong>/<strong>Mapbox GL JS</strong> for frontend logic, styling, and mapping visualization</li>
              <li className="pl-2 py-1"><strong>NextBus API</strong> for TTC vehicle prediction data</li>
              <li className="pl-2 py-1"><strong>Google Maps Directions API</strong> for routing data</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default InfoPopup;
