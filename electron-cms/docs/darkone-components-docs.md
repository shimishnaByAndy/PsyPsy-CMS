# Darkone-React_v1.0 JS Components Documentation

## AnimationStar

**File path:** `Darkone-React_v1.0/JS/src/components/AnimationStar.jsx`

### Component Content

```jsx
const AnimationStar = () => {
  return <>
      <div className="animated-stars">
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
        <div className="shooting-star" />
      </div>
    </>;
};
export default AnimationStar;
```

---

## ComponentContainerCard

**File path:** `Darkone-React_v1.0/JS/src/components/ComponentContainerCard.jsx`

### Component Content

```jsx
import clsx from 'clsx';
import { Card, CardBody, CardTitle } from 'react-bootstrap';
import { Link } from 'react-router-dom';
const ComponentContainerCard = ({
  title,
  id,
  description,
  children,
  titleClass,
  descriptionClass
}) => {
  return <Card>
      <CardBody>
        <CardTitle as={'h5'} className={clsx('anchor mb-1', titleClass)} id={id}>
          {title}
          <Link className="anchor-link" to={`#${id}`}>
            #
          </Link>
        </CardTitle>
        {!!description && <p className={clsx('text-muted', descriptionClass)}>{description}</p>}
        <>{children}</>
      </CardBody>
    </Card>;
};
export default ComponentContainerCard;
```

---

## CustomFlatpickr

**File path:** `Darkone-React_v1.0/JS/src/components/CustomFlatpickr.jsx`

### Component Content

```jsx
import 'flatpickr/dist/themes/light.css';
import Flatpickr from 'react-flatpickr';
const CustomFlatpickr = ({
  className,
  value,
  options,
  placeholder
}) => {
  return <>
      <Flatpickr className={className} data-enable-time value={value} options={options} placeholder={placeholder} />
    </>;
};
export default CustomFlatpickr;
```

---

## FallbackLoading

**File path:** `Darkone-React_v1.0/JS/src/components/FallbackLoading.jsx`

### Component Content

```jsx
const FallbackLoading = () => {
  return <div></div>;
};
export default FallbackLoading;
```

---

## PageTitle

**File path:** `Darkone-React_v1.0/JS/src/components/PageTitle.jsx`

### Component Content

```jsx
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from './wrapper/IconifyIcon';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';
import { Helmet } from 'react-helmet-async';
const PageTitle = ({
  title,
  subName
}) => {
  const defaultTitle = DEFAULT_PAGE_TITLE;
  return <>
      <Helmet>
        <title>{title ? title + ' | ' + defaultTitle : defaultTitle}</title>
      </Helmet>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="mb-0 ">{title}</h4>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="">{subName}</Link>
              </li>{' '}
              &nbsp;
              <div className="mx-1">
                <IconifyIcon icon="bx:chevron-right" />
              </div>
              &nbsp;
              <li className="breadcrumb-item active">{title}</li>
            </ol>
          </div>
        </Col>
      </Row>
    </>;
};
export default PageTitle;
```

---

## Preloader

**File path:** `Darkone-React_v1.0/JS/src/components/Preloader.jsx`

### Component Content

```jsx
const Preloader = () => <div className="preloader-progress-bar">
    <div className="progress-value" />
  </div>;
export default Preloader;
```

---

## Spinner

**File path:** `Darkone-React_v1.0/JS/src/components/Spinner.jsx`

### Component Content

```jsx
const Spinner = ({
  tag = 'div',
  type = 'bordered',
  className,
  color,
  size,
  children
}) => {
  const Tag = tag || 'div';
  return <Tag role="status" className={`${type === 'bordered' ? 'spinner-border' : type === 'grow' ? 'spinner-grow' : ''} ${color ? `text-${color}` : 'text-primary'} ${size ? 'avatar-' + size : ''} ${className}`}>
      {children}
    </Tag>;
};
export default Spinner;
```

---

## ThemeCustomizer

**File path:** `Darkone-React_v1.0/JS/src/components/ThemeCustomizer.jsx`

### Component Content

```jsx
import { Button, Col, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { useLayoutContext } from '@/context/useLayoutContext';
import { toSentenceCase } from '@/utils/change-casing';
import SimplebarReactClient from './wrapper/SimplebarReactClient';
const ColorScheme = () => {
  const {
    theme,
    changeTheme
  } = useLayoutContext();
  const modes = ['light', 'dark'];
  return <div>
      <h5 className="mb-3 font-16 fw-semibold">Color Scheme</h5>
      {modes.map((mode, idx) => <div key={mode + idx} className="form-check mb-2">
          <input className="form-check-input" type="radio" name="data-bs-theme" id={`layout-color-${mode}`} onChange={() => changeTheme(mode)} checked={theme === mode} />
          <label className="form-check-label" htmlFor={`layout-color-${mode}`}>
            {toSentenceCase(mode)}
          </label>
        </div>)}
    </div>;
};
const TopbarTheme = () => {
  const {
    topbarTheme,
    changeTopbarTheme
  } = useLayoutContext();
  const modes = ['light', 'dark'];
  return <div>
      <h5 className="my-3 font-16 fw-semibold">Topbar Color</h5>
      {modes.map((mode, idx) => <div key={idx + mode} className="form-check mb-2">
          <input className="form-check-input" type="radio" name="data-topbar-color" id={`topbar-color-${mode}`} onChange={() => changeTopbarTheme(mode)} checked={topbarTheme === mode} />
          <label className="form-check-label" htmlFor={`topbar-color-${mode}`}>
            {toSentenceCase(mode)}
          </label>
        </div>)}
    </div>;
};
const MenuTheme = () => {
  const {
    menu: {
      theme
    },
    changeMenu: {
      theme: changeMenuTheme
    }
  } = useLayoutContext();
  const modes = ['light', 'dark'];
  return <div>
      <h5 className="my-3 font-16 fw-semibold">Menu Color</h5>
      {modes.map((mode, idx) => <div key={idx + mode + idx} className="form-check mb-2">
          <input className="form-check-input" type="radio" name="data-menu-color" id={`leftbar-color-${mode}`} onChange={() => changeMenuTheme(mode)} checked={theme === mode} />
          <label className="form-check-label" htmlFor={`leftbar-color-${mode}`}>
            {toSentenceCase(mode)}
          </label>
        </div>)}
    </div>;
};
const SidebarSize = () => {
  const {
    menu: {
      size: menuSize
    },
    changeMenu: {
      size: changeMenuSize
    }
  } = useLayoutContext();
  const sizes = [{
    name: 'Default',
    size: 'default'
  }, {
    name: 'Condensed',
    size: 'condensed'
  }, {
    name: 'Hidden',
    size: 'hidden'
  }, {
    name: 'Small Hover',
    size: 'sm-hover'
  }];
  return <div>
      <h5 className="my-3 font-16 fw-semibold">Sidebar Size</h5>
      {sizes.map((size, idx) => <div key={size.size + idx} className="form-check mb-2">
          <input className="form-check-input" type="radio" name="data-menu-size" id={`leftbar-size-${size.size}`} onChange={() => changeMenuSize(size.size)} checked={menuSize === size.size} />
          <label className="form-check-label" htmlFor={`leftbar-size-${size.size}`}>
            {size.name}
          </label>
        </div>)}
    </div>;
};
const ThemeCustomizer = ({
  open,
  toggle
}) => {
  const {
    resetSettings,
    theme
  } = useLayoutContext();
  return <div>
      <Offcanvas placement="end" show={open} onHide={toggle} className="border-0 rounded-start-4 overflow-hidden" tabIndex={-1}>
        <OffcanvasHeader closeVariant="white" closeButton className="d-flex align-items-center bg-primary p-3">
          <h5 className="text-white m-0">Theme Settings</h5>
        </OffcanvasHeader>
        <OffcanvasBody className="p-0">
          <SimplebarReactClient className="h-100">
            <div className="p-3 settings-bar">
              <ColorScheme />

              {theme === 'light' && <TopbarTheme />}

              {theme === 'light' && <MenuTheme />}

              <SidebarSize />
            </div>
          </SimplebarReactClient>
        </OffcanvasBody>
        <div className="offcanvas-footer border-top p-3 text-center">
          <Row>
            <Col>
              <Button variant="danger" onClick={resetSettings} className="w-100">
                Reset
              </Button>
            </Col>
          </Row>
        </div>
      </Offcanvas>
    </div>;
};
export default ThemeCustomizer;
```

---

## BaseVectorMap

**File path:** `Darkone-React_v1.0/JS/src/components/VectorMap/BaseVectorMap.jsx`

### Component Content

```jsx
import { useEffect, useState } from 'react';
const BaseVectorMap = ({
  width,
  height,
  options,
  type
}) => {
  const selectorId = type + new Date().getTime();
  const [map, setMap] = useState();
  useEffect(() => {
    if (!map) {
      // create jsvectormap
      const map = new window['jsVectorMap']({
        selector: '#' + selectorId,
        map: type,
        ...options
      });
      setMap(map);
    }
  }, [selectorId, map, options, type]);
  return <>
      <div id={selectorId} style={{
      width: width,
      height: height
    }}></div>
    </>;
};
export default BaseVectorMap;
```

---

## CanadaMap

**File path:** `Darkone-React_v1.0/JS/src/components/VectorMap/CanadaMap.jsx`

### Component Content

```jsx
import 'jsvectormap';
import 'jsvectormap/dist/maps/canada.js';
import BaseVectorMap from './BaseVectorMap';
const CanadaVectorMap = ({
  width,
  height,
  options
}) => {
  return <>
      <BaseVectorMap width={width} height={height} options={options} type="canada" />
    </>;
};
export default CanadaVectorMap;
```

---

## IraqVectorMap

**File path:** `Darkone-React_v1.0/JS/src/components/VectorMap/IraqVectorMap.jsx`

### Component Content

```jsx
import 'jsvectormap';
import 'jsvectormap/dist/maps/iraq.js';

//components
import BaseVectorMap from './BaseVectorMap';
const IraqVectorMap = ({
  width,
  height,
  options
}) => {
  return <>
      <BaseVectorMap width={width} height={height} options={options} type="iraq" />
    </>;
};
export default IraqVectorMap;
```

---

## RussiaMap

**File path:** `Darkone-React_v1.0/JS/src/components/VectorMap/RussiaMap.jsx`

### Component Content

```jsx
import 'jsvectormap';
import 'jsvectormap/dist/maps/russia.js';

//components
import BaseVectorMap from './BaseVectorMap';
const RussiaVectorMap = ({
  width,
  height,
  options
}) => {
  return <>
      <BaseVectorMap width={width} height={height} options={options} type="russia" />
    </>;
};
export default RussiaVectorMap;
```

---

## SpainMap

**File path:** `Darkone-React_v1.0/JS/src/components/VectorMap/SpainMap.jsx`

### Component Content

```jsx
import 'jsvectormap';
import 'jsvectormap/dist/maps/spain.js';

//components
import BaseVectorMap from './BaseVectorMap';
const SpainVectorMap = ({
  width,
  height,
  options
}) => {
  return <>
      <BaseVectorMap width={width} height={height} options={options} type="spain" />
    </>;
};
export default SpainVectorMap;
```

---

## WorldMap

**File path:** `Darkone-React_v1.0/JS/src/components/VectorMap/WorldMap.jsx`

### Component Content

```jsx
'use client';

import 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';

//components
import BaseVectorMap from './BaseVectorMap';
const WorldVectorMap = ({
  width,
  height,
  options
}) => {
  return <>
      <BaseVectorMap width={width} height={height} options={options} type="world" />
    </>;
};
export default WorldVectorMap;
```

---

## index

**File path:** `Darkone-React_v1.0/JS/src/components/VectorMap/index.jsx`

### Component Content

```jsx
import WorldVectorMap from './WorldMap';
import CanadaVectorMap from './CanadaMap';
import RussiaVectorMap from './RussiaMap';
import SpainVectorMap from './SpainMap';
import IraqVectorMap from './IraqVectorMap';
export { WorldVectorMap, CanadaVectorMap, RussiaVectorMap, IraqVectorMap, SpainVectorMap };
```

---

## ChoicesFormInput

**File path:** `Darkone-React_v1.0/JS/src/components/from/ChoicesFormInput.jsx`

### Component Content

```jsx
import Choices from 'choices.js';
import { useEffect, useRef } from 'react';
const ChoicesFormInput = ({
  children,
  multiple,
  className,
  onChange,
  allowInput,
  options,
  ...props
}) => {
  const choicesRef = useRef(null);
  useEffect(() => {
    if (choicesRef.current) {
      const choices = new Choices(choicesRef.current, {
        ...options,
        placeholder: true,
        allowHTML: true,
        shouldSort: false
      });
      choices.passedElement.element.addEventListener('change', e => {
        if (!(e.target instanceof HTMLSelectElement)) return;
        if (onChange) {
          onChange(e.target.value);
        }
      });
    }
  }, [choicesRef]);
  return allowInput ? <input ref={choicesRef} multiple={multiple} className={className} {...props} /> : <select ref={choicesRef} multiple={multiple} className={className} {...props}>
      {children}
    </select>;
};
export default ChoicesFormInput;
```

---

## DropzoneFormInput

**File path:** `Darkone-React_v1.0/JS/src/components/from/DropzoneFormInput.jsx`

### Component Content

```jsx
import { Card, Col, FormLabel, FormText, Row } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import useFileUploader from '@/hooks/useFileUploader';
import IconifyIcon from '../wrapper/IconifyIcon';
import { Link } from 'react-router-dom';
const DropzoneFormInput = ({
  label,
  labelClassName,
  helpText,
  iconProps,
  showPreview,
  className,
  text,
  textClassName,
  onFileUpload
}) => {
  const {
    selectedFiles,
    handleAcceptedFiles,
    removeFile
  } = useFileUploader(showPreview);
  return <>
      {label && <FormLabel className={labelClassName}>{label}</FormLabel>}

      <Dropzone onDrop={acceptedFiles => handleAcceptedFiles(acceptedFiles, onFileUpload)} maxFiles={5}>
        {({
        getRootProps,
        getInputProps
      }) => <>
            <div className={`dropzone dropzone-custom ${className}`}>
              <div className="dz-message" {...getRootProps()}>
                <input {...getInputProps()} />
                <IconifyIcon icon={iconProps?.icon ?? 'bx:cloud-upload'} {...iconProps} />
                <h3 className={textClassName}>{text}</h3>
                {helpText && typeof helpText === 'string' ? <FormText>{helpText}</FormText> : helpText}
              </div>
            </div>
            {showPreview && selectedFiles.length > 0 && <div className="dz-preview mt-3">
                {(selectedFiles || []).map((file, idx) => {
            const ext = file.name.substr(file.name.lastIndexOf('.') + 1);
            return <Card className="mt-1 mb-0 shadow-none border" key={idx + '-file'}>
                      <div className="p-2">
                        <Row className="align-items-center">
                          {file.preview ? <Col xs={'auto'}>
                              <img data-dz-thumbnail="" className="avatar-sm rounded bg-light" alt={file.name} src={file.preview} />
                            </Col> : <Col xs={'auto'}>
                              <div className="avatar-sm">
                                <span className="avatar-title bg-primary rounded">{ext.toUpperCase()}</span>
                              </div>
                            </Col>}
                          <Col className="ps-0">
                            <Link to="" className="text-muted fw-bold">
                              {file.name}
                            </Link>
                            <p className="mb-0">
                              <strong>{file.formattedSize}</strong>
                            </p>
                          </Col>
                          <Col className="text-end">
                            <Link to="" className="btn btn-link btn-lg text-muted shadow-none">
                              <div className="flex-shrink-0 ms-3">
                                <button data-dz-remove className="btn btn-sm btn-primary" onClick={() => removeFile(file)}>
                                  Delete
                                </button>
                              </div>
                            </Link>
                          </Col>
                        </Row>
                      </div>
                    </Card>;
          })}
              </div>}
          </>}
      </Dropzone>
    </>;
};
export default DropzoneFormInput;
```

---

## PasswordFormInput

**File path:** `Darkone-React_v1.0/JS/src/components/from/PasswordFormInput.jsx`

### Component Content

```jsx
import { useState } from 'react';
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller } from 'react-hook-form';
import IconifyIcon from '../wrapper/IconifyIcon';
const PasswordFormInput = ({
  name,
  containerClassName: containerClass,
  control,
  id,
  labelClassName: labelClass,
  label,
  noValidate,
  ...other
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return <Controller name={name} defaultValue={''} control={control} render={({
    field,
    fieldState
  }) => <FormGroup className={containerClass ?? ''}>
          {label && (typeof label === 'string' ? <FormLabel htmlFor={id ?? name} className={labelClass}>
                {label}
              </FormLabel> : <>{label}</>)}
          <div className="position-relative">
            <FormControl id={id} type={showPassword ? 'text' : 'password'} {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
            {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
            <span className="d-flex position-absolute top-50 end-0 translate-middle-y p-0 pe-2 me-2" onClick={() => setShowPassword(!showPassword)}>
              {!fieldState.error && (showPassword ? <IconifyIcon icon="bi:eye-slash-fill" height={18} width={18} className="cursor-pointer" /> : <IconifyIcon icon="bi:eye-fill" height={18} width={18} className="cursor-pointer" />)}
            </span>
          </div>
        </FormGroup>} />;
};
export default PasswordFormInput;
```

---

## TextAreaFormInput

**File path:** `Darkone-React_v1.0/JS/src/components/from/TextAreaFormInput.jsx`

### Component Content

```jsx
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller } from 'react-hook-form';
const TextAreaFormInput = ({
  name,
  rows = 3,
  containerClassName,
  control,
  id,
  label,
  noValidate,
  ...other
}) => {
  return <Controller name={name} defaultValue={''} control={control} render={({
    field,
    fieldState
  }) => <FormGroup className={containerClassName ?? ''}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl id={id} rows={rows} as="textarea" {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
          {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
        </FormGroup>} />;
};
export default TextAreaFormInput;
```

---

## TextFormInput

**File path:** `Darkone-React_v1.0/JS/src/components/from/TextFormInput.jsx`

### Component Content

```jsx
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller } from 'react-hook-form';
const TextFormInput = ({
  name,
  containerClassName: containerClass,
  control,
  id,
  label,
  noValidate,
  labelClassName: labelClass,
  ...other
}) => {
  return <Controller name={name} defaultValue={''} control={control} render={({
    field,
    fieldState
  }) => <FormGroup className={containerClass}>
          {label && (typeof label === 'string' ? <FormLabel htmlFor={id ?? name} className={labelClass}>
                {label}
              </FormLabel> : <>{label}</>)}
          <FormControl id={id ?? name} {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
          {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
        </FormGroup>} />;
};
export default TextFormInput;
```

---

## Footer

**File path:** `Darkone-React_v1.0/JS/src/components/layout/Footer.jsx`

### Component Content

```jsx
import { currentYear } from '@/context/constants';
import { Col, Row } from 'react-bootstrap';
const Footer = () => {
  return <footer className="footer">
      <div className="container-fluid">
        <Row>
          <Col xs={12} className=" text-center">
            {currentYear}&nbsp;© Darkone by StackBros.
          </Col>
        </Row>
      </div>
    </footer>;
};
export default Footer;
```

---

## LeftSideBarToggle

**File path:** `Darkone-React_v1.0/JS/src/components/layout/TopNavigationBar/components/LeftSideBarToggle.jsx`

### Component Content

```jsx
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { useLayoutContext } from '@/context/useLayoutContext';
import useViewPort from '@/hooks/useViewPort';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
const LeftSideBarToggle = () => {
  const {
    menu: {
      size
    },
    changeMenu: {
      size: changeMenuSize
    },
    toggleBackdrop
  } = useLayoutContext();
  const {
    pathname
  } = useLocation();
  const {
    width
  } = useViewPort();
  const isFirstRender = useRef(true);
  const handleMenuSize = () => {
    if (size === 'hidden') toggleBackdrop();
    if (size === 'condensed') changeMenuSize('default');else if (size === 'default') changeMenuSize('condensed');
  };
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (size === 'hidden') {
      toggleBackdrop();
    }
    if (width <= 1140) {
      if (size !== 'hidden') changeMenuSize('hidden');
    }
  }, [pathname, width]);
  return <div className="topbar-item">
      <button type="button" onClick={handleMenuSize} className="button-toggle-menu topbar-button">
        <IconifyIcon icon="solar:hamburger-menu-outline" width={24} height={24} className="fs-24  align-middle" />
      </button>
    </div>;
};
export default LeftSideBarToggle;
```

---

## Notifications

**File path:** `Darkone-React_v1.0/JS/src/components/layout/TopNavigationBar/components/Notifications.jsx`

### Component Content

```jsx
import { notificationsData } from '@/assets/data/topbar';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import SimplebarReactClient from '@/components/wrapper/SimplebarReactClient';
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
const NotificationItem = ({
  from,
  content,
  icon
}) => {
  return <DropdownItem className="py-3 border-bottom text-wrap">
      <div className="d-flex">
        <div className="flex-shrink-0">
          {icon ? <img src={icon} className="img-fluid me-2 avatar-sm rounded-circle" alt="avatar-1" /> : <div className="avatar-sm me-2">
              <span className="avatar-title bg-soft-info text-info fs-20 rounded-circle">{from.charAt(0).toUpperCase()}</span>
            </div>}
        </div>
        <div className="flex-grow-1">
          <span className="mb-0 fw-semibold">{from}</span>
          <span className="mb-0 text-wrap">{content}</span>
        </div>
      </div>
    </DropdownItem>;
};
const Notifications = () => {
  const notificationList = notificationsData;
  return <Dropdown className="topbar-item ">
      <DropdownToggle as={'a'} type="button" className="topbar-button position-relative content-none" id="page-header-notifications-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <IconifyIcon icon="solar:bell-bing-outline" className="fs-22 align-middle " />
        <span className="position-absolute topbar-badge fs-10 translate-middle badge bg-danger rounded-pill">
          5<span className="visually-hidden">unread messages</span>
        </span>
      </DropdownToggle>
      <DropdownMenu className="py-0 dropdown-lg dropdown-menu-end" aria-labelledby="page-header-notifications-dropdown">
        <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
          <Row className="align-items-center">
            <Col>
              <h6 className="m-0 fs-16 fw-semibold"> Notifications (5)</h6>
            </Col>
            <Col xs={'auto'}>
              <Link to="" className="text-dark text-decoration-underline">
                <small>Clear All</small>
              </Link>
            </Col>
          </Row>
        </div>
        <SimplebarReactClient style={{
        maxHeight: 280
      }}>
          {notificationList.map((notification, idx) => <NotificationItem key={idx} {...notification} />)}
        </SimplebarReactClient>
        <div className="text-center py-3">
          <Link to="" className="btn btn-primary btn-sm">
            View All Notification <IconifyIcon icon="bx:right-arrow-alt" className="ms-1" />
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>;
};
export default Notifications;
```

---

## ProfileDropdown

**File path:** `Darkone-React_v1.0/JS/src/components/layout/TopNavigationBar/components/ProfileDropdown.jsx`

### Component Content

```jsx
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { useAuthContext } from '@/context/useAuthContext';
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { Link } from 'react-router-dom';
const ProfileDropdown = () => {
  const {
    removeSession
  } = useAuthContext();
  return <Dropdown className=" topbar-item">
      <DropdownToggle type="button" className="topbar-button content-none" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span className="d-flex align-items-center">
          <img className="rounded-circle" width={32}
        // height={32}
        src={avatar1} alt="avatar-3" />
        </span>
      </DropdownToggle>
      <DropdownMenu className=" dropdown-menu-end">
        <DropdownHeader>Welcome!</DropdownHeader>
        <DropdownItem href="">
          <IconifyIcon icon="solar:user-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">My Account</span>
        </DropdownItem>
        <DropdownItem href="">
          <IconifyIcon icon="solar:wallet-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">Pricing</span>
        </DropdownItem>
        <DropdownItem href="">
          <IconifyIcon icon="solar:help-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">Help</span>
        </DropdownItem>
        <DropdownItem href="/auth/lock-screen">
          <IconifyIcon icon="solar:lock-keyhole-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">Lock screen</span>
        </DropdownItem>
        <div className="dropdown-divider my-1" />
        <DropdownItem as={Link} className=" text-danger" to="/auth/sign-in">
          <IconifyIcon icon="solar:logout-3-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle" onClick={removeSession}>
            Logout
          </span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>;
};
export default ProfileDropdown;
```

---

## ThemeModeToggle

**File path:** `Darkone-React_v1.0/JS/src/components/layout/TopNavigationBar/components/ThemeModeToggle.jsx`

### Component Content

```jsx
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { useLayoutContext } from '@/context/useLayoutContext';
const ThemeModeToggle = () => {
  const {
    theme,
    changeTheme
  } = useLayoutContext();
  const isDark = theme === 'dark';
  return <div className="topbar-item">
      <button type="button" onClick={() => changeTheme(isDark ? 'light' : 'dark')} className="topbar-button" id="light-dark-mode">
        {theme == 'dark' ? <IconifyIcon icon="ri:sun-line" className="fs-22 dark-mode" /> : <IconifyIcon icon="ri:moon-line" className="fs-22 light-mode" />}
      </button>
    </div>;
};
export default ThemeModeToggle;
```

---

## page

**File path:** `Darkone-React_v1.0/JS/src/components/layout/TopNavigationBar/page.jsx`

### Component Content

```jsx
import LeftSideBarToggle from './components/LeftSideBarToggle';
import ProfileDropdown from './components/ProfileDropdown';
import ThemeModeToggle from './components/ThemeModeToggle';
import { Container } from 'react-bootstrap';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import Notifications from './components/Notifications';
const page = () => {
  return <header className="app-topbar">
      <div>
        <Container fluid>
          <div className="navbar-header">
            <div className="d-flex align-items-center gap-2">
              <LeftSideBarToggle />
              <form className="app-search d-none d-md-block me-auto">
                <div className="position-relative">
                  <input type="search" className="form-control" placeholder="admin,widgets..." autoComplete="off" />
                  <IconifyIcon icon="solar:magnifer-outline" className="search-widget-icon" />
                </div>
              </form>
            </div>
            <div className="d-flex align-items-center gap-2">
              <ThemeModeToggle />
              <Notifications />
              <ProfileDropdown />
            </div>
          </div>
        </Container>
      </div>
    </header>;
};
export default page;
```

---

## AppMenu

**File path:** `Darkone-React_v1.0/JS/src/components/layout/VerticalNavigationBar/components/AppMenu.jsx`

### Component Content

```jsx
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { findAllParent, findMenuItem, getMenuItemFromURL } from '@/helpers/Manu';
import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
const MenuItemWithChildren = ({
  item,
  className,
  linkClassName,
  subMenuClassName,
  activeMenuItems,
  toggleMenu
}) => {
  const [open, setOpen] = useState(activeMenuItems.includes(item.key));
  useEffect(() => {
    setOpen(activeMenuItems.includes(item.key));
  }, [activeMenuItems, item]);
  const toggleMenuItem = e => {
    e.preventDefault();
    const status = !open;
    setOpen(status);
    if (toggleMenu) toggleMenu(item, status);
    return false;
  };
  const getActiveClass = useCallback(item => {
    return activeMenuItems?.includes(item.key) ? 'active' : '';
  }, [activeMenuItems]);
  return <li className={className}>
      <div onClick={toggleMenuItem} aria-expanded={open} role="button" className={clsx(linkClassName)}>
        {item.icon && <span className="nav-icon">
            <IconifyIcon icon={item.icon} />
          </span>}
        <span className="nav-text">{item.label}</span>
        {!item.badge ? <IconifyIcon icon="bx:chevron-down" className="menu-arrow ms-auto" /> : <span className={`badge badge-pill text-end bg-${item.badge.variant}`}>{item.badge.text}</span>}
      </div>
      <Collapse in={open}>
        <div>
          <ul className={clsx(subMenuClassName)}>
            {(item.children || []).map((child, idx) => {
            return <Fragment key={child.key + idx}>
                  {child.children ? <MenuItemWithChildren item={child} linkClassName={clsx('nav-link ', getActiveClass(child))} activeMenuItems={activeMenuItems} className="sub-nav-item" subMenuClassName="nav sub-navbar-nav" toggleMenu={toggleMenu} /> : <MenuItem item={child} className="sub-nav-item" linkClassName={clsx('sub-nav-link', getActiveClass(child))} />}
                </Fragment>;
          })}
          </ul>
        </div>
      </Collapse>
    </li>;
};
const MenuItem = ({
  item,
  className,
  linkClassName
}) => {
  return <li className={className}>
      <MenuItemLink item={item} className={linkClassName} />
    </li>;
};
const MenuItemLink = ({
  item,
  className
}) => {
  return <Link to={item.url ?? ''} target={item.target} className={clsx(className, {
    disabled: item.isDisabled
  })}>
      {item.icon && <span className="nav-icon">
          <IconifyIcon icon={item.icon} />
        </span>}
      <span className="nav-text ">{item.label}</span>
      {item.badge && <span className={`badge badge-pill text-end bg-${item.badge.variant}`}>{item.badge.text}</span>}
    </Link>;
};
const AppMenu = ({
  menuItems
}) => {
  const {
    pathname
  } = useLocation();
  const [activeMenuItems, setActiveMenuItems] = useState([]);
  const toggleMenu = (menuItem, show) => {
    if (show) setActiveMenuItems([menuItem.key, ...findAllParent(menuItems, menuItem)]);
  };
  const getActiveClass = useCallback(item => {
    return activeMenuItems?.includes(item.key) ? 'active' : '';
  }, [activeMenuItems]);
  const activeMenu = useCallback(() => {
    const trimmedURL = pathname?.replace('', '');
    const matchingMenuItem = getMenuItemFromURL(menuItems, trimmedURL);
    if (matchingMenuItem) {
      const activeMt = findMenuItem(menuItems, matchingMenuItem.key);
      if (activeMt) {
        setActiveMenuItems([activeMt.key, ...findAllParent(menuItems, activeMt)]);
      }
      setTimeout(() => {
        const activatedItem = document.querySelector(`#leftside-menu-container .simplebar-content a[href="${trimmedURL}"]`);
        if (activatedItem) {
          const simplebarContent = document.querySelector('#leftside-menu-container .simplebar-content-wrapper');
          if (simplebarContent) {
            const offset = activatedItem.offsetTop - window.innerHeight * 0.4;
            scrollTo(simplebarContent, offset, 600);
          }
        }
      }, 400);

      // scrollTo (Left Side Bar Active Menu)
      const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      };
      const scrollTo = (element, to, duration) => {
        const start = element.scrollTop,
          change = to - start,
          increment = 20;
        let currentTime = 0;
        const animateScroll = function () {
          currentTime += increment;
          const val = easeInOutQuad(currentTime, start, change, duration);
          element.scrollTop = val;
          if (currentTime < duration) {
            setTimeout(animateScroll, increment);
          }
        };
        animateScroll();
      };
    }
  }, [pathname, menuItems]);
  useEffect(() => {
    if (menuItems && menuItems.length > 0) activeMenu();
  }, [activeMenu, menuItems]);
  return <ul className="navbar-nav " id="navbar-nav" style={{
    textTransform: 'capitalize'
  }}>
      {(menuItems || []).map((item, idx) => {
      return <Fragment key={item.key + idx}>
            {item.isTitle ? <li className={clsx('menu-title')}>{item.label}</li> : <>
                {item.children ? <MenuItemWithChildren item={item} toggleMenu={toggleMenu} className="nav-item" linkClassName={clsx('nav-link', getActiveClass(item))} subMenuClassName="nav sub-navbar-nav" activeMenuItems={activeMenuItems} /> : <MenuItem item={item} linkClassName={clsx('nav-link', getActiveClass(item))} className="nav-item " />}
              </>}
          </Fragment>;
    })}
    </ul>;
};
export default AppMenu;
```

---

## page

**File path:** `Darkone-React_v1.0/JS/src/components/layout/VerticalNavigationBar/page.jsx`

### Component Content

```jsx
import { getMenuItems } from '@/helpers/Manu';
import SimplebarReactClient from '@/components/wrapper/SimplebarReactClient';
import LogoBox from '@/components/wrapper/LogoBox';
import AppMenu from './components/AppMenu';
const page = () => {
  const menuItems = getMenuItems();
  return <div className="app-sidebar">
      <LogoBox />
      <SimplebarReactClient className="scrollbar" data-simplebar>
        <AppMenu menuItems={menuItems} />
      </SimplebarReactClient>
    </div>;
};
export default page;
```

---

## AppProvidersWrapper

**File path:** `Darkone-React_v1.0/JS/src/components/wrapper/AppProvidersWrapper.jsx`

### Component Content

```jsx
import { AuthProvider } from '@/context/useAuthContext';
import { LayoutProvider } from '@/context/useLayoutContext';
import { NotificationProvider } from '@/context/useNotificationContext';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
const AppProvidersWrapper = ({
  children
}) => {
  return <>
      <HelmetProvider>
        <AuthProvider>
          <LayoutProvider>
            <NotificationProvider>
              {children}
              <ToastContainer theme="colored" />
            </NotificationProvider>
          </LayoutProvider>
        </AuthProvider>
      </HelmetProvider>
    </>;
};
export default AppProvidersWrapper;
```

---

## IconifyIcon

**File path:** `Darkone-React_v1.0/JS/src/components/wrapper/IconifyIcon.jsx`

### Component Content

```jsx
import { Icon } from '@iconify/react';
const IconifyIcon = props => {
  return <Icon {...props} />;
};
export default IconifyIcon;
```

---

## LogoBox

**File path:** `Darkone-React_v1.0/JS/src/components/wrapper/LogoBox.jsx`

### Component Content

```jsx
import logoDark from '@/assets/images/logo-dark.png';
import logoLight from '@/assets/images/logo-light.png';
import logoSm from '@/assets/images/logo-sm.png';
import { Link } from 'react-router-dom';
const LogoBox = () => {
  return <div className="logo-box">
      <Link to="/dashboards" className="logo-dark">
        <img width={24} height={24} src={logoSm} className="logo-sm" alt="logo sm" />
        <img width={114} height={28} src={logoDark} className="logo-lg" alt="logo dark" />
      </Link>
      <Link to="/dashboards" className="logo-light">
        <img width={24} height={24} src={logoSm} className="logo-sm" alt="logo sm" />
        <img width={114} height={28} src={logoLight} className="logo-lg" alt="logo light" />
      </Link>
    </div>;
};
export default LogoBox;
```

---

## SimplebarReactClient

**File path:** `Darkone-React_v1.0/JS/src/components/wrapper/SimplebarReactClient.jsx`

### Component Content

```jsx
import SimpleBar from 'simplebar-react';
const SimplebarReactClient = ({
  children,
  ...options
}) => {
  return <SimpleBar {...options}>{children}</SimpleBar>;
};
export default SimplebarReactClient;
```

---

