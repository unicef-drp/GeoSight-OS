import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSelector } from 'react-redux';
import { Index as SummaryGroupWidget } from '../../../src/components/Widget/SummaryGroupWidget';

// Mock Redux store
jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

describe('SummaryGroupWidget', () => {
    const mockData = [
        { entity_name: 'Entity 1', value: 100, date: '2024-01-01' },
        { entity_name: 'Entity 1', value: 200, date: '2024-01-02' },
        { entity_name: 'Entity 2', value: 150, date: '2024-01-01' }
    ];

    const mockWidgetData = {
        name: 'Test Widget',
        config: {
            operation: 'SUM',
            property_2: 'entity_name'
        }
    };

    beforeEach(() => {
        // Mock Redux selectors
        useSelector.mockImplementation((selector) => {
            if (selector === (state) => state.dashboard.data.referenceLayer) {
                return { identifier: 'test-layer' };
            }
            if (selector === (state) => state.datasetGeometries['test-layer']) {
                return {
                    'Entity 1': { label: 'Entity 1' },
                    'Entity 2': { label: 'Entity 2' }
                };
            }
            return null;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders grouped data by entity_name', () => {
        render(
            <SummaryGroupWidget
                data={mockData}
                widgetData={mockWidgetData}
            />
        );

        // Verify table headers
        expect(screen.getByText('Entity Name')).toBeInTheDocument();
        expect(screen.getByText('Value')).toBeInTheDocument();

        // Verify grouped data
        const entity1Value = screen.getByText('300');
        const entity2Value = screen.getByText('150');

        expect(entity1Value).toBeInTheDocument();
        expect(entity2Value).toBeInTheDocument();
    });

    test('handles special characters in entity names', () => {
        const specialData = [
            { entity_name: 'Entity!@#$', value: 100, date: '2024-01-01' },
            { entity_name: 'Entity!@#$', value: 200, date: '2024-01-02' }
        ];

        render(
            <SummaryGroupWidget
                data={specialData}
                widgetData={mockWidgetData}
            />
        );

        // Verify special characters are preserved
        expect(screen.getByText('Entity!@#$')).toBeInTheDocument();
        expect(screen.getByText('300')).toBeInTheDocument();
    });

    test('handles empty entity names', () => {
        const emptyData = [
            { entity_name: '', value: 100, date: '2024-01-01' },
            { entity_name: 'Valid Entity', value: 200, date: '2024-01-02' }
        ];

        render(
            <SummaryGroupWidget
                data={emptyData}
                widgetData={mockWidgetData}
            />
        );

        // Verify both empty and valid entity names are shown
        expect(screen.getByText('')).toBeInTheDocument();
        expect(screen.getByText('Valid Entity')).toBeInTheDocument();
    });

    test('shows loading state when no data', () => {
        render(
            <SummaryGroupWidget
                data={null}
                widgetData={mockWidgetData}
            />
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('handles error state', () => {
        const errorData = {
            error: 'Test error message'
        };

        render(
            <SummaryGroupWidget
                data={errorData}
                widgetData={mockWidgetData}
            />
        );

        expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    test('groups data with different operations', () => {
        const mockWidgetDataWithCount = {
            name: 'Test Widget',
            config: {
                operation: 'COUNT',
                property_2: 'entity_name'
            }
        };

        render(
            <SummaryGroupWidget
                data={mockData}
                widgetData={mockWidgetDataWithCount}
            />
        );

        // Verify count operation
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });
});
