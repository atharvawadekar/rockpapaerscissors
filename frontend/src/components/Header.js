import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';

function Header() {
  return (
    <Stack sx={{backgroundColor:'skyblue'}}>
        <Typography textAlign='center'>Rock paper scissors</Typography>
    </Stack>
  )
}

export default Header;