import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Box, styled } from '@mui/material';

const PageTitle = styled(Box)(
  ({ theme }) => `
        margin: ${theme.spacing(2)} ${theme.spacing(4)} ${theme.spacing(2)};
        padding: ${theme.spacing(2.5)} ${theme.spacing(3)};
        color: #fffdf7;
        background: #143923;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-left: 5px solid #e27039;
        border-radius: 12px;
        box-shadow: 0 12px 30px rgba(20, 57, 35, 0.07);

        h1, h2, .MuiTypography-h1, .MuiTypography-h2 {
          color: #fffdf7;
          font-family: Georgia, serif;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .MuiTypography-subtitle1, .MuiTypography-subtitle2, p {
          color: rgba(255, 255, 255, 0.7);
        }

        .MuiButton-containedPrimary {
          background: #e27039;
          color: #fffdf7;
        }

        .MuiButton-containedPrimary:hover {
          background: #c85b2a;
        }

        .MuiButton-outlinedPrimary {
          color: #fffdf7;
          border-color: rgba(255, 255, 255, 0.34);
          background: rgba(255, 255, 255, 0.06);
        }

        ${theme.breakpoints.down('sm')} {
          margin: ${theme.spacing(1.5)};
          padding: ${theme.spacing(2)};
        }

        & > * {
          min-width: 0;
        }
`
);

interface PageTitleWrapperProps {
  children?: ReactNode;
}

const PageTitleWrapper: FC<PageTitleWrapperProps> = ({ children }) => {
  return <PageTitle className="MuiPageTitle-wrapper">{children}</PageTitle>;
};

PageTitleWrapper.propTypes = {
  children: PropTypes.node.isRequired
};

export default PageTitleWrapper;
