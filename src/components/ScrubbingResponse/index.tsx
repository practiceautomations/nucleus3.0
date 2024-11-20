import type { AllClaimsScrubResponseResult } from '@/store/shared/types';
import classNames from '@/utils/classNames';

import Button, { ButtonType } from '../UI/Button';
import CloseButton from '../UI/CloseButton';

type ScrubingResponseProps = {
  onClose: () => void;
  data?: AllClaimsScrubResponseResult;
};

const ScrubingResponseModal = ({ onClose, data }: ScrubingResponseProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
      <div className="flex w-full flex-col items-start justify-start px-6 py-4">
        <div className="inline-flex w-full items-center justify-between">
          <div className="flex items-center justify-start space-x-2">
            <p className="text-xl font-bold leading-7 text-cyan-600">
              {'Claim(s) Scrubbed Validations'}
            </p>
          </div>
          <div className="inline-flex items-center gap-4">
            <CloseButton onClick={onClose} />
          </div>
        </div>
      </div>

      {/* Scrubbing response section */}
      <div
        className="h-full w-full overflow-y-auto bg-white px-6 py-4"
        style={{ textAlign: 'left' }}
      >
        {data?.scrubValidations &&
          data?.scrubValidations.map((claim) => {
            const hasIssues = claim.issues && claim.issues.length > 0;

            return (
              <div
                key={claim.id}
                className={`mb-4 p-4 border-2 rounded-lg ${
                  hasIssues
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-green-500 text-green-500 bg-green-50'
                }`}
              >
                <div
                  className={`flex flex-col justify-between ${
                    hasIssues ? 'border-red-500' : 'border-green-500'
                  }`}
                >
                  <div className="text-sm">{`Claim ID:`}</div>
                  <h2
                    className={`text-lg font-bold ${
                      hasIssues ? ' text-red-800' : ' text-green-800'
                    }`}
                  >
                    {`#${claim.id} - ${claim.title}`}
                  </h2>
                </div>

                {hasIssues && (
                  <div className="mt-2">
                    <p className="font-semibold text-red-500">Issues:</p>
                    <ul className="list-inside list-disc text-red-500">
                      {claim.issues?.map((issue, index) => (
                        <li key={index}>{issue.issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        <div className="flex w-full gap-4">
          {data?.scrubResponse && data?.scrubResponse.length ? (
            <div
              className={classNames(
                `flex flex-col`,
                data?.adnareScrubResponse && data?.adnareScrubResponse.length
                  ? `w-[50%]`
                  : `w-full`
              )}
            >
              <div className="py-2 text-xl font-bold text-gray-500">
                {'Alpha II Response:'}
              </div>
              {data?.scrubResponse.map((claim) => {
                const hasIssues = claim.issues && claim.issues.length > 0;

                return (
                  <div
                    key={claim.id}
                    style={{ textAlign: 'left' }}
                    className={`mb-4 p-4 border-2 rounded-lg ${
                      hasIssues
                        ? 'border-red-500 text-red-500 bg-red-50'
                        : 'border-green-500 text-green-500 bg-green-50'
                    }`}
                  >
                    <div
                      className={`flex flex-col justify-between ${
                        hasIssues ? 'border-red-500' : 'border-green-500'
                      }`}
                    >
                      <div className="text-sm">{`Claim ID:`}</div>
                      <h2
                        className={`text-lg font-bold ${
                          hasIssues ? ' text-red-800' : ' text-green-800'
                        }`}
                      >
                        {`#${claim.id} - ${claim.title}`}
                      </h2>
                    </div>

                    {hasIssues && (
                      <div className="mt-2">
                        <p className="font-semibold text-red-500">Issues:</p>
                        <ul className="list-inside list-disc text-red-500">
                          {claim.issues?.map((issue, index) => (
                            <li key={index}>{issue.issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>{''}</>
          )}
          {data?.adnareScrubResponse && data?.adnareScrubResponse.length ? (
            <div
              className={classNames(
                `flex flex-col`,
                data?.scrubResponse && data?.scrubResponse.length
                  ? `w-[50%]`
                  : `w-full`
              )}
            >
              <div className="py-2 text-xl font-bold text-gray-500">
                {'AI Denial Predictor Response:'}
              </div>
              {data?.adnareScrubResponse.map((claim) => {
                const hasIssues = claim.issues && claim.issues.length > 0;

                return (
                  <div
                    key={claim.id}
                    style={{ textAlign: 'left' }}
                    className={`mb-4 p-4 border-2 rounded-lg flex flex-col  ${
                      hasIssues
                        ? 'border-red-500 text-red-500 bg-red-50'
                        : 'border-green-500 text-green-500 bg-green-50'
                    }`}
                  >
                    <div
                      className={`flex flex-col justify-between ${
                        hasIssues ? 'border-red-500' : 'border-green-500'
                      }`}
                    >
                      <div className="text-sm">{`Claim ID:`}</div>
                      <h2
                        className={`text-lg font-bold ${
                          hasIssues ? ' text-red-800' : ' text-green-800'
                        }`}
                      >
                        {`#${claim.id} - ${claim.title}`}
                        {/* - {hasIssues ? 'Errors Found' : 'Success'} */}
                      </h2>
                    </div>

                    {/* Issues Section */}
                    {hasIssues && (
                      <div className="mt-2">
                        <p className="font-semibold text-red-500">Issues:</p>
                        <ul className="list-inside list-disc text-red-500">
                          {claim.issues?.map((issue, index) => (
                            <li key={index}>{issue.issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>{''}</>
          )}
        </div>
      </div>

      {/* Footer with Close button */}
      <div className="w-full bg-gray-200">
        <div className="py-6 pr-6">
          <div className="flex justify-end gap-4">
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[110px]`}
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrubingResponseModal;
