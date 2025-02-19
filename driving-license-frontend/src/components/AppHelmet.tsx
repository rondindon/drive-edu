import React from 'react';
import { Helmet } from 'react-helmet';

interface AppHelmetProps {
  title?: string;
  description?: string;
}

const AppHelmet: React.FC<AppHelmetProps> = ({
  title,
  description,
}) => {
  return (
    <Helmet>
      <title>{title ? title : "DriveReady - Driving License Test Portal"}</title>
      <meta charSet="utf-8" />
      <meta name="description" content={description ? description : 'DriveReady offers interactive driving license tests, simulators, and study resources for aspiring drivers.'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href="https://www.driveready.com" />
    </Helmet>
  );
};

export default AppHelmet;