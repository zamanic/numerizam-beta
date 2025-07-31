import { useState } from 'react'
import { Button, Menu, MenuItem, Box, Typography, Popover, Divider } from '@mui/material'
import { DateRange, KeyboardArrowDown } from '@mui/icons-material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'

type DateRange = {
  label: string
  startDate: Date
  endDate: Date
}

const DateRangeSelector = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [customAnchorEl, setCustomAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    label: 'This Quarter',
    startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
    endDate: new Date(),
  })
  const [customStartDate, setCustomStartDate] = useState<Date | null>(new Date())
  const [customEndDate, setCustomEndDate] = useState<Date | null>(new Date())

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCustomClick = (event: React.MouseEvent<HTMLElement>) => {
    handleClose()
    setCustomAnchorEl(event.currentTarget)
  }

  const handleCustomClose = () => {
    setCustomAnchorEl(null)
  }

  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setSelectedRange({
        label: `${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`,
        startDate: customStartDate,
        endDate: customEndDate,
      })
    }
    handleCustomClose()
  }

  const predefinedRanges: DateRange[] = [
    {
      label: 'Today',
      startDate: new Date(),
      endDate: new Date(),
    },
    {
      label: 'Yesterday',
      startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
      label: 'This Week',
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
      endDate: new Date(),
    },
    {
      label: 'Last Week',
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 7)),
      endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 1)),
    },
    {
      label: 'This Month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    },
    {
      label: 'Last Month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    },
    {
      label: 'This Quarter',
      startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
      endDate: new Date(),
    },
    {
      label: 'Year to Date',
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
    },
    {
      label: 'Last 12 Months',
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      endDate: new Date(),
    },
  ]

  const handleSelectRange = (range: DateRange) => {
    setSelectedRange(range)
    handleClose()
  }

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<DateRange />}
        endIcon={<KeyboardArrowDown />}
        variant="outlined"
        color="inherit"
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          textTransform: 'none',
          px: 2,
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
        }}
      >
        {selectedRange.label}
      </Button>

      {/* Predefined ranges menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 200,
            maxHeight: 300,
          },
        }}
      >
        {predefinedRanges.map((range) => (
          <MenuItem
            key={range.label}
            onClick={() => handleSelectRange(range)}
            selected={selectedRange.label === range.label}
            sx={{ minHeight: '40px' }}
          >
            {range.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={handleCustomClick} sx={{ minHeight: '40px' }}>
          Custom Range
        </MenuItem>
      </Menu>

      {/* Custom date range popover */}
      <Popover
        open={Boolean(customAnchorEl)}
        anchorEl={customAnchorEl}
        onClose={handleCustomClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            p: 2,
            width: 300,
          },
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Custom Date Range
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mb: 2 }}>
            <DatePicker
              label="Start Date"
              value={customStartDate}
              onChange={(newValue) => setCustomStartDate(newValue)}
              slotProps={{ textField: { fullWidth: true, size: 'small', margin: 'dense' } }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <DatePicker
              label="End Date"
              value={customEndDate}
              onChange={(newValue) => setCustomEndDate(newValue)}
              slotProps={{ textField: { fullWidth: true, size: 'small', margin: 'dense' } }}
            />
          </Box>
        </LocalizationProvider>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={handleCustomClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleApplyCustomRange}>
            Apply
          </Button>
        </Box>
      </Popover>
    </>
  )
}

export default DateRangeSelector