import { DefaultLayout } from 'components/layout';
import { AccessRequest } from 'features/access-request';
import { AdminRouter, WorkOrderForm, WorkOrderList } from 'features/admin';
import { RequestClip } from 'features/clips';
import { ContentForm, ContentListView, Papers } from 'features/content';
import { DemoPage } from 'features/demo';
import { Login } from 'features/login';
import { AVOverview, AVOverviewPreview, ReportPreview, ReportsRouter } from 'features/reports';
import { StorageListView } from 'features/storage';
import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useApp } from 'store/hooks';
import { Claim, ContentTypeName, InternalServerError, NotFound } from 'tno-core';

import { PrivateRoute } from '.';

export interface IAppRouter {
  name: string;
}

/**
 * AppRouter provides a SPA router to manage routes.
 * Renders router when the application has been initialized.
 * @returns AppRouter component.
 */
export const AppRouter: React.FC<IAppRouter> = ({ name }) => {
  const [, { authenticated }] = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    // There is a race condition, when keycloak is ready state related to user claims will not be.
    // Additionally, when the user is not authenticated keycloak also is not initialized (which makes no sense).
    if (!authenticated && !window.location.pathname.startsWith('/login'))
      navigate(`/login?redirectTo=${window.location.pathname}`);
  }, [authenticated, navigate]);

  return (
    <Routes>
      <Route path="/" element={<DefaultLayout name={name} />}>
        <Route path="/" element={<Navigate to="/contents" />} />
        <Route path="login" element={<Login />} />
        <Route path="welcome" element={<AccessRequest />} />
        <Route path="access/request" element={<AccessRequest />} />
        <Route
          path="admin/*"
          element={<PrivateRoute claims={Claim.administrator} element={<AdminRouter />} />}
        />
        <Route
          path="contents"
          element={
            <PrivateRoute claims={Claim.editor} element={<ContentListView />}></PrivateRoute>
          }
        />
        <Route
          path="contents/:id"
          element={<PrivateRoute claims={Claim.editor} element={<ContentForm />}></PrivateRoute>}
        />
        <Route
          path="/contents/combined/:id"
          element={
            <PrivateRoute claims={Claim.editor} element={<ContentListView />}></PrivateRoute>
          }
        />
        <Route
          path="snippets/:id"
          element={
            <PrivateRoute
              claims={Claim.editor}
              element={<ContentForm contentType={ContentTypeName.AudioVideo} />}
            ></PrivateRoute>
          }
        />
        <Route
          path="papers/:id"
          element={
            <PrivateRoute
              claims={Claim.editor}
              element={<ContentForm contentType={ContentTypeName.PrintContent} />}
            ></PrivateRoute>
          }
        />
        <Route
          path="images/:id"
          element={
            <PrivateRoute
              claims={Claim.editor}
              element={<ContentForm contentType={ContentTypeName.Image} />}
            ></PrivateRoute>
          }
        />
        <Route
          path="stories/:id"
          element={
            <PrivateRoute
              claims={Claim.editor}
              element={<ContentForm contentType={ContentTypeName.Story} />}
            ></PrivateRoute>
          }
        />
        <Route
          path="papers"
          element={<PrivateRoute claims={Claim.editor} element={<Papers />}></PrivateRoute>}
        />
        <Route
          path="/papers/combined/:id"
          element={<PrivateRoute claims={Claim.editor} element={<Papers />}></PrivateRoute>}
        />
        <Route
          path="storage/locations/:id"
          element={
            <PrivateRoute claims={Claim.editor} element={<StorageListView />}></PrivateRoute>
          }
        />
        <Route path="clips" element={<RequestClip />} />
        <Route path="work/orders" element={<WorkOrderList />} />
        <Route path="work/orders/:id" element={<WorkOrderForm />} />
        <Route
          path="reports/av/overviews"
          element={<PrivateRoute claims={Claim.editor} element={<AVOverview />}></PrivateRoute>}
        />
        <Route
          path="reports/av/overviews/:id"
          element={
            <PrivateRoute claims={Claim.editor} element={<AVOverviewPreview />}></PrivateRoute>
          }
        />
        <Route
          path="reports/:id/preview"
          element={<PrivateRoute claims={Claim.editor} element={<ReportPreview />}></PrivateRoute>}
        />
        <Route
          path="reports/*"
          element={<PrivateRoute claims={Claim.administrator} element={<ReportsRouter />} />}
        />
        <Route
          path="reports/*"
          element={<PrivateRoute claims={Claim.administrator} element={<ReportsRouter />} />}
        />
        <Route path="demo" element={<DemoPage />} />
        <Route path="error" element={<InternalServerError />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
