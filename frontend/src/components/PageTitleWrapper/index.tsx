import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Box, styled } from '@mui/material';

const PageTitle = styled(Box)(
  ({ theme }) => `
        padding: ${theme.spacing(3)} ${theme.spacing(4)} ${theme.spacing(2)};

        ${theme.breakpoints.down('sm')} {
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
