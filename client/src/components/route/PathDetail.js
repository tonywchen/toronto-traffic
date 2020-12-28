import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const TrafficDetail = ({from, to, timestamp}) => {
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    dispatchFetchPathDetail();
  }, []);

  const dispatchFetchPathDetail = async () => {
    const pathDetail = await dispatch();

  };
};

export const TrafficDetail;
