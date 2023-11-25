import { Fragment } from 'react'
import { Link } from "react-router-dom"
import { Menu, Transition } from '@headlessui/react'
import Avatar from "../../molecules/avatar"
import { classNames } from '../../../utils/className'

interface NavigationProps {
    name: string;
    href: string;
}

interface MenuAvatarProps {
    userNavigation: NavigationProps[]
    className?: string;
}

function MenuAvatar({userNavigation, className} : MenuAvatarProps){
    return (
        <div className={className}>
            <Menu as="div" className="relative">
                <Menu.Button>
                    <Avatar />
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item, index) => (
                            <Menu.Item key={index}>
                            {({ active }) => (
                                <Link
                                to={item.href}
                                className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                )}
                                >
                                {item.name}
                                </Link>
                            )}
                        </Menu.Item>
                        ))}
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    )
}

export default MenuAvatar