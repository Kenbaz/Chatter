import { FC } from 'react';

interface CustomPullToRefreshIndicatorProps {
    // pullProgress: number;
    refreshing: boolean;
}

const CustomPullToRefreshIndicator: FC<CustomPullToRefreshIndicatorProps> = ({ refreshing }) => {

    return (
        <div className="flex justify-center items-center h-16">
            {refreshing && (
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            )}
        </div>
    );
};

export default CustomPullToRefreshIndicator;