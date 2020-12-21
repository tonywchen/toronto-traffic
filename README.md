**Live Site** https://ttcongestion.tonywchen.com

<br/>

# What is TTCongestion?
TTCongestion attempts to visualize Toronto traffic based on real-time TTC vehicle prediction data. TTC vehicle prediction data predict how long before a vehicle is expected to pull into a specific stop. Until the vehicle has passed the stop, the prediction can change over time due to the traffic status (or other reasons). TTCongestion aggregates these prediction data and 
transform them into traffic data and visaulize these traffic data on a map. This project is also an opportunity to practice MERN stack, specifically **React/React Hook/Redux** for frontend, **Mapbox GL JS** for mapping visualization.

<br/>

# Current Version (Dec 21, 2021)
The current version of TTCongestion includes the following features
- Display traffic data along **504 King** route
- Map to display **colour-coded traffic data **
- **Date Selector** to load daily traffic data from different dates
- **Timeline Scroll** to scroll through the daily traffic data
- **Timeline Playback** to automatically animate the daily traffic data with varying speeds
- **Timeline Preview** to preview the daily traffic data at a glance so that the user can make informed decisions on where to scroll to
- **Responsiveness** to ensure easy visualization and user-friendly interactive controls on smartphones, tablets, and desktop browsers

<br/>

# Requirement Gathering
In order to visualize the traffic, we will first need the following data:
- TTC routes (from NextBus API)
- TTC stops along the routes (from NextBus API)
- TTC vehicle predictions for every stop on a regular interval (from NextBus API)
- Routing between each stop (from Routing API)

Based on these data, we will also need to compute the following:
- Traffic status between each stop

To display the data in a meaningful way:
- Mapping library to display traffic status between each stop
- A Date/Time controller to visualize the traffic

<br/>

# Implementation

## Background Jobs
### Fetch Preictions
A lightweight job that is fetching from Nextbus API every minute. The 1-minute frequency is a compromise between data storage (lower frequency requires less storage) and meaningfulness of the data (where higher frequency is more desirable).

### Convert Predictions Into Traffic
This does the heavy-lifting to convert predictions into meaning traffic data. This requires grouping prediction data, calculating changes in predictions, map the changes to a specific path (ie. path between to stops), fetching routing data for the path, validating, and persisting the final data. This proved to be the most time-consuming part of the project so far after discovering glitches and limitations with the source data, and several workarounds, including a self-learning component that learns actual transit route instead of relying on the incorrect transit route configs that have been provided.

<br/>

## Database
MongoDB for the **M**ERN stack. It also suits the less-structured nature of the data.

## Server
Node.js and Express for the M**E**R**N** stack. For now, this is fairly lightweight and only need to be able to serve the traffic for a handful of criteria (eg. date, time).

## Client
React for the ME**R**N stack, and Mapbox GL JS for mapping. Some efforts are being put into learning React Hook/Redux, React component lifecycle for UI optimization, and using Mapbox GL JS in a more "React" kind of way rather than just directly using the API.

<br/>

# Challenges
**NextBus API**
- Rate Limit: There are some soft guidelines on the API usage but not hard rate limit. However, the size of data seem to be the bigger concern (see **Server Limitation**)
- Data Reliability: The data specification seem to be rather open-ended and are implemented differently by the transit operator. Some examples include "`tripTag`(not really a unique identifier and is being re-used by TTC) and `routeTag` (prediction data is showing `routeTag` not previously defined in route configurations), and glitches in the predictions (eg. a vehicle suddenly "teleports* across the city for a brief period)

**Routing API**

Potential routing APIs are Mapbox or Google Maps
- Rate Limit: Mapbox and Google Maps' routing API are well-above what is required for the project (eg. thousands of requests allowed monthly)
- Data Reliability: Some researches have been done and it seems neither API provides perfect routing between two transit stops. Google Maps bicycling routing is doing the best
job of all but still need some manual tweaks.

**Data Storage**

The current server has a **20GB** storage. Based on observations, the predictions data is taking up about **90MB** of data per day for
- *one route*
- *polling frequency of 1 minute*
- stored in MongoDB 3.4 WiredTiger snappy compression

Some optimizations have been made to trim the data to 50GB for now. Will need to explore more optimization, better data compressions, or possibly increasing data storage in order to support more routes in the future.

<br/>

# Future
A few future features/enhancements that have been considered:
- Add more transit routes (more pretty-looking data!)
- Interactive mapping elements (opens up more user interactivity)
- Additional path detail and historical trends (would be interesting to see how a particular path does compared to another)
- Overall historical trends (would be interesting to see the best/worst performing path, time, day of the week, etc)
- Path editing (some routing can use some tweaking)

<br/>

# Resource/Tech Used
## Data Source
- **NextbusAPI** for TTC vehicle prediction data
- **Google Maps Directions API** for routing data

## Database
- **MongoDB**

## Server
- **Node.js/Express** to serve traffic data
- **Agenda** for scheduling background jobs
- **Mongoose** for ORM

## Client
- **ReactJS/React Hook/Redux** for frontend framework
- **Tailwind CSS** for styling
- **Mapbox GL JS** for mapping visualization
