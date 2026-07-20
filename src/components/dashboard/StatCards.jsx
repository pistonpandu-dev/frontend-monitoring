import React from 'react';
import { FaDesktop, FaWifi, FaServer, FaBan } from 'react-icons/fa';

const StatCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Perangkat',
      value: stats.total || 0,
      icon: FaDesktop,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
    },
    {
      title: 'Perangkat Online',
      value: stats.online || 0,
      icon: FaWifi,
      color: 'bg-green-500',
      textColor: 'text-green-500',
    },
    {
      title: 'Perangkat Offline',
      value: stats.offline || 0,
      icon: FaServer,
      color: 'bg-red-500',
      textColor: 'text-red-500',
    },
    {
      title: 'Perangkat Dinonaktifkan',
      value: stats.inactive || 0,
      icon: FaBan,
      color: 'bg-gray-500',
      textColor: 'text-gray-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} bg-opacity-10 p-3 rounded-full`}>
                <Icon className={`text-xl ${card.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
