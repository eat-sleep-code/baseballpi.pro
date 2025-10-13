import React, { useState } from 'react';
import { X } from 'lucide-react';

const PrivacyAndTermsModal = ({ isOpen, onClose }) => {
	const [activeTab, setActiveTab] = useState('privacy');

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10">
				<div className="p-6 border-b border-white/10">
					<div className="flex items-center justify-between mb-4">
						<div className="flex gap-2 flex-1">
							<button
								onClick={() => setActiveTab('privacy')}
								className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'privacy'
									? 'bg-blue-600 text-white'
									: 'bg-white/5 text-gray-300 hover:bg-white/10'
									}`}
							>
								Privacy Policy
							</button>
							<button
								onClick={() => setActiveTab('terms')}
								className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'terms'
									? 'bg-blue-600 text-white'
									: 'bg-white/5 text-gray-300 hover:bg-white/10'
									}`}
							>
								Terms of Service
							</button>
						</div>
						<button
							onClick={onClose}
							className="p-2 hover:bg-white/10 rounded-lg transition-all ml-4"
							aria-label="Close modal"
						>
							<X size={24} className="text-white" />
						</button>
					</div>

					<h2 className="text-2xl font-bold text-white mb-2">
						{activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
					</h2>
					<p className="text-sm text-gray-400">
						Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
					</p>
				</div>

				<div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40`">
					{activeTab === 'privacy' ? (
						<div className="space-y-6 text-gray-300">
							We wrote this privacy statement to help you understand what information we collect, how we use it, and what choices you have.
							Some of the concepts below are a little technical, but we've tried our best to explain things in a simple and clear way.
							We welcome your <a href="mailto:privacy@baseballpi.pro" target="_blank">questions and comments</a> on this statement.
							<br />

							<h3 className="text-lg font-semibold text-white mb-1">What we know about you</h3>
							These days, whenever you use a web site, web application, mobile application, or other internet service, there's certain information that almost always gets created and recorded automatically.
							<br />
							<ul className="list-disc list-outside space-y-2 ml-6 pl-2">
								<li>When you use our web application, our servers automatically record usage logs. This log data may include your IP address, the address of the pages on our site that you visited, your browser type, and the date and time of your request.   This information may be used to address site performance and security concerns.   As such, it is not possible to opt-out of this data collection.   These log files are permanently deleted from our servers after 30 days.</li>
								<li>Depending on how you're accessing our products, we may use "cookies" (small text files sent by your computer each time you visit our web application, unique to your your browser) or similar technologies to record data. When we use cookies, we use "session" cookies (that last only until you close your web browser). For example, we may use cookies to store your language preference, how you have filtered or sorted data, etc.</li>
								<li>When you complete our contact us forms, you voluntarily give us certain information. This can include your name, your email address, and any other information you intentionally provide us.</li>
								<li>You also may give us permission to access your information in other services. For example, you may follow us on social media, which allows us to obtain information from those accounts (like your friends or contacts). The information we get from those services often depends on your settings or their privacy policies, so be sure to check what those are.</li>
								<li>We utilize Google Analytics to monitor web application usage behaviors and performance.   Google Analytics prohibits the storage of personally identifable information.   You may <a href="https://support.google.com/analytics/answer/181881" target="_blank">opt-out of Google Analytics data collection</a>.</li>
								<li>We honor your browser's "Do Not Track" setting.</li>
							</ul>
							If you learn that your minor child has provided us with personally identifiable information without your consent, please <a href="mailto:privacy@baseballpi.pro" target="_blank">contact us</a> immediately.
							<br />

							<h3 className="text-lg font-semibold text-white mb-1">What we do to protect your information</h3>
							<ul className="list-disc list-outside space-y-2 ml-6 pl-2">
								<li>This web application has security measures in place to protect the loss, misuse, and alteration of the information under our control.</li>
								<li>Our web application also utilizes HTTP Strict Transport Security (HSTS) which enforces HTTPS for all communications to and from our web application.</li>
								<li>We do NOT sell your information to anyone.</li>
								<li>We do NOT permit access to any information you provide us by any organizations engaged in political lobbying or analysis.</li>
								<li>We only share your information if we believe that disclosure is reasonably necessary to comply with United States laws, regulations, or legal requests; to protect the safety, rights, or property of the public or any person; or to detect, prevent, or otherwise address fraud, security, or technical issues.</li>
							</ul>

							<h3 className="text-lg font-semibold text-white mb-1">Links to other resources</h3>
							This web application may contains links to other web sites and applications.  baseballpi.pro and its associated individuals and organizations are not responsible for the privacy practices or the content of such web applications.
							<br />

							<h3 className="text-lg font-semibold text-white mb-1">How you can opt out</h3>
							We do not store personally identifiable information.   However if you have other privacy related questions, you may email the following email address: <a href="mailto:privacy@baseballpi.pro" target="_blank">privacy@baseballpi.pro</a>
							<br />
							
							<h3 className="text-lg font-semibold text-white mb-1">How you can contact us</h3>
							If you wish to contact the operators of this web application in regards to this privacy statement, your rights under the California Consumer Privacy Act (CCPA) and the General Data Protection Regulation (GDPR), or the practices of this web application, you may email the following email address: <a href="mailto:privacy@baseballpi.pro" target="_blank">privacy@baseballpi.pro</a>
							<br />
							<br />
						</div>
					) : (
						<div className="space-y-6 text-gray-300">
							<h3 className="text-lg font-semibold text-white mb-1">Acceptance of Terms</h3>
							Use of this web application constitutes an agreement to these Terms Of Use and our Privacy Statement..
							<br />


							<h3 className="text-lg font-semibold text-white mb-1">Use License</h3>
							Permission is granted to temporarily access the materials on our service for personal, non-commercial transitory viewing only.
							<br />


							<h3 className="text-lg font-semibold text-white mb-1">Limitation of Liability</h3>
							You may not hold the owners and operators (or any associated parties) of the this web application liable or financially responsible for any damages including—but not limited to—emotional, physical, or financial damages incurred before, during, or after the use of this web application or any referenced websites.
							<br />


							<h3 className="text-lg font-semibold text-white mb-1">Modifications</h3>
							We reserve the right to revise these terms of service at any time without notice. By using this service you are agreeing to be bound by the current version of these terms.
							<br />


							<h3 className="text-lg font-semibold text-white mb-1">Trademarks</h3>
						
							All game data is the property of **Major League Baseball Properties, Inc.**
							<br />
							<br />
							The following are trademarks or service marks of Major League Baseball entities and may be used only with permission of Major League Baseball Properties, Inc. or the relevant Major League Baseball entity: Major League, Major League Baseball, MLB, the silhouetted batter logo, World Series, National League, American League, Division Series, League Championship Series, All-Star Game, and the names, nicknames, logos, uniform designs, color combinations, and slogans designating the Major League Baseball clubs and entities, and their respective mascots, events and exhibitions.
							<br />
							<br />
							This web application was created for personal use only and does not construe any rights to use this data without the express permission of Major League Baseball Properties, Inc.
							<br />
							<br />
							Other trademarks used throughout this repository are the property of their respective owners and are used for identification purposes only.
							You may not hold the owners and operators (or any associated parties) of the this web application and related repositories liable or financially responsible for any damages including—but not limited to—emotional, physical, or financial damages incurred during or after the use of this repository or any referenced websites. Use of this web application, associated repositories, and/or the code found within constitutes an agreement to these terms.
							<br />

							<br />
							
						</div>

					)}
				</div>
			</div>
		</div>
	);
};

export default PrivacyAndTermsModal;