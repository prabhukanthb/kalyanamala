import { render, screen } from '@testing-library/react';
import ProfileDownloadCard from './ProfileDownloadCard';

const profile = {
  profileId: 'M00001',
  firstName: 'Ravi',
  lastName: 'Kumar',
  dateOfBirth: '1995-01-15',
  heightFeet: 5,
  heightInches: 8,
  maritalStatus: 'Nevermarried',
  religion: 'Hindu',
  highestEducation: 'B.Tech',
  occupation: 'Engineer',
  income: 800000,
  incomeCurrency: 'INR',
  fatherName: 'Rao',
  fatherOccupation: 'Teacher',
  motherName: 'Lakshmi',
  motherOccupation: 'Homemaker',
  motherNativePlace: 'Ongole',
  siblingsCount: 1,
  nativePlace: 'Guntur',
  fatherNativePlace: 'Vijayawada',
  preferredMatch: 'any_religion',
  partnerRequirement: 'Looking for a kind partner from the Mala community.',
  aboutMe: 'Software engineer.',
  currentAddress: { city: 'Hyderabad', state: 'Telangana' },
  userId: {
    email: 'secret@example.com',
    phone: '9876543210',
    alternativePhone: '9123456789'
  }
};

test('PNG card shows native places and partner requirement without contact PII', () => {
  render(<ProfileDownloadCard profile={profile} onClose={() => {}} />);

  expect(screen.getByText('Guntur')).toBeInTheDocument();
  expect(screen.getByText('Vijayawada')).toBeInTheDocument();
  expect(screen.getByText('Ongole')).toBeInTheDocument();
  expect(screen.getByText('Looking for a kind partner from the Mala community.')).toBeInTheDocument();
  expect(screen.getAllByText('Never Married').length).toBeGreaterThan(0);
  expect(screen.getByText('M00001')).toBeInTheDocument();
  expect(screen.queryByText('secret@example.com')).not.toBeInTheDocument();
  expect(screen.queryByText('9876543210')).not.toBeInTheDocument();
  expect(screen.queryByText('9123456789')).not.toBeInTheDocument();
});
