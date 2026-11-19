import sys
import os
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import (
    User, RoleEnum, Department, JobRole, OfficialProfile,
    CompetencyDomain, Competency, RoleCompetencyRequirement, CompetencyResult,
    Assessment, AssessmentQuestion, AssessmentAttempt,
    Course, CourseCompetencyMapping, NSSTATrainingProgramme,
    LearningPath, LearningPathModule, UserLearningProgress,
    Notification, IntegrationSetting, SyncLog
)

def seed_all():
    db = SessionLocal()
    try:
        print("Checking if database already has seed data...")
        if db.query(User).filter_by(email="admin@statskill.gov.in").first():
            print("Database already seeded. Skipping initial seeding.")
            return

        print("Seeding Departments...")
        departments = [
            Department(name="National Accounts Division (NAD)", code="MoSPI-NAD", description="Compiles National Income, GDP, Gross Value Added, and macroeconomic aggregates for India."),
            Department(name="Field Operations Division (FOD) - NSSO", code="MoSPI-FOD", description="Executes nation-wide socio-economic surveys, agricultural surveys, and price collections across all states/UTs."),
            Department(name="Price Statistics Division (PSD)", code="MoSPI-PSD", description="Compiles Consumer Price Index (CPI), Wholesale Price Index (WPI) inputs, and Inflation statistics."),
            Department(name="Social Statistics Division (SSD) / SDG Cell", code="MoSPI-SSD", description="Maintains National Indicator Framework (NIF) for Sustainable Development Goals (SDGs) and Social Statistics."),
            Department(name="Economic Statistics Division (ESD)", code="MoSPI-ESD", description="Conducts Annual Survey of Industries (ASI), Index of Industrial Production (IIP), and Economic Census."),
            Department(name="National Statistical Systems Training Academy (NSSTA)", code="NSSTA", description="Apex capacity-building and training institution for official statistical personnel in India and international trainees.")
        ]
        db.add_all(departments)
        db.flush()

        dept_map = {d.code: d for d in departments}

        print("Seeding Job Roles...")
        job_roles = [
            JobRole(department_id=dept_map["MoSPI-PSD"].id, title="Senior Statistical Officer - Price Statistics", code="SSO-PSD", cadre="SSS", description="Responsible for rural/urban price data validation, commodity weight verification, and preliminary CPI compilation."),
            JobRole(department_id=dept_map["MoSPI-NAD"].id, title="Assistant Director - National Accounts", code="AD-NAD", cadre="ISS", description="Oversees institutional sector sequence of accounts, input-output tables, and Gross Value Added estimations."),
            JobRole(department_id=dept_map["MoSPI-FOD"].id, title="Field Operations Supervisor - NSSO", code="FOS-FOD", cadre="SSS", description="Supervises primary data collectors in NSSO rounds, ensures sampling protocol adherence, and field inspection."),
            JobRole(department_id=dept_map["MoSPI-SSD"].id, title="Deputy Director - SDG Indicators & Social Statistics", code="DD-SSD", cadre="ISS", description="Coordinates state indicator frameworks, metadata harmonization, and UN SDG reporting."),
            JobRole(department_id=dept_map["MoSPI-ESD"].id, title="Statistical Data Analyst - Enterprise & Industrial Statistics", code="SDA-ESD", cadre="Contract", description="Conducts factory returns data cleaning, automated anomaly detection, and classification under NIC/NPCS."),
            JobRole(department_id=dept_map["NSSTA"].id, title="Faculty / Training Coordinator - Statistical Capacity Building", code="FTC-NSSTA", cadre="ISS", description="Designs competency-based curricula, facilitates residential and digital modules for statistical officials.")
        ]
        db.add_all(job_roles)
        db.flush()
        role_map = {r.code: r for r in job_roles}

        print("Seeding Competency Domains...")
        domains = [
            CompetencyDomain(name="Statistical Competencies", code="statistical", description="Core concepts, statistical methods, economic accounting, and survey methodologies for official statistics.", display_order=1),
            CompetencyDomain(name="Technical Competencies", code="technical", description="Computational software, data science, databases, programming, GIS, and modern analytical tools.", display_order=2),
            CompetencyDomain(name="Digital Governance", code="digital_governance", description="Government cloud, cybersecurity, data confidentiality, e-Office protocols, and digital infrastructure.", display_order=3),
            CompetencyDomain(name="Behavioural & Managerial", code="behavioural_managerial", description="Leadership, clear technical writing, ethics in official statistics, and evidence-based decision-making.", display_order=4)
        ]
        db.add_all(domains)
        db.flush()
        domain_map = {d.code: d for d in domains}

        print("Seeding Competencies...")
        competencies = [
            # Statistical
            Competency(domain_id=domain_map["statistical"].id, name="Survey Design & Methodology", code="STAT-SURVEY", description="Design of probability sampling surveys, questionnaire formulation, and frame construction."),
            Competency(domain_id=domain_map["statistical"].id, name="Sampling Techniques & Estimation", code="STAT-SAMPLING", description="Stratified multistage sampling, design weights, post-stratification, and variance estimation."),
            Competency(domain_id=domain_map["statistical"].id, name="National Accounts Compilation (SNA 2008)", code="STAT-SNA", description="System of National Accounts, GDP, GVA, supply-use tables, and deflator estimation."),
            Competency(domain_id=domain_map["statistical"].id, name="Price Statistics & Index Numbers", code="STAT-PRICE", description="Laspeyres, Paasche, Fisher formulae, CPI, WPI compilation, quality adjustment, and price imputation."),
            Competency(domain_id=domain_map["statistical"].id, name="Labour Market Statistics & PLFS", code="STAT-LABOUR", description="Periodic Labour Force Survey concepts, usual status, current weekly status, and worker population ratios."),
            Competency(domain_id=domain_map["statistical"].id, name="Sustainable Development Goals (SDG) Indicators", code="STAT-SDG", description="National Indicator Framework (NIF), disaggregation standards, and Tier I/II/III methodology."),
            Competency(domain_id=domain_map["statistical"].id, name="Statistical Metadata Standards (SDMX)", code="STAT-SDMX", description="Statistical Data and Metadata Exchange standards, data structure definitions, and codelists."),
            Competency(domain_id=domain_map["statistical"].id, name="Data Quality Assurance Framework (DQAF)", code="STAT-DQAF", description="IMF/UN/MoSPI data quality dimensions: integrity, methodological soundness, accuracy, serviceability, accessibility."),

            # Technical
            Competency(domain_id=domain_map["technical"].id, name="Python for Statistical Computing", code="TECH-PYTHON", description="pandas, numpy, scipy, statsmodels for automated data pipelines and survey analysis."),
            Competency(domain_id=domain_map["technical"].id, name="R for Econometrics & Survey Analysis", code="TECH-R", description="survey package, tidyverse, sampling weights, regression models, and automated reporting."),
            Competency(domain_id=domain_map["technical"].id, name="SQL & Relational Databases", code="TECH-SQL", description="PostgreSQL, complex joins, window functions, statistical aggregation, and query tuning."),
            Competency(domain_id=domain_map["technical"].id, name="Stata & Econometric Modeling", code="TECH-STATA", description="Panel data, microdata manipulation, survey estimation, and reproducible do-files."),
            Competency(domain_id=domain_map["technical"].id, name="GIS & Spatial Statistics", code="TECH-GIS", description="QGIS, spatial autocorrelation, georeferencing administrative boundaries, and thematic mapping."),
            Competency(domain_id=domain_map["technical"].id, name="Data Visualization & Dashboards", code="TECH-VIZ", description="Effective communication of official indicators using charts, heatmaps, and interactive dashboards."),
            Competency(domain_id=domain_map["technical"].id, name="AI & Machine Learning for Official Statistics", code="TECH-AIML", description="Responsible AI, predictive imputation, automated text classification for commodity codes, and satellite imagery analysis."),

            # Digital Governance
            Competency(domain_id=domain_map["digital_governance"].id, name="Data Confidentiality & Anonymization", code="GOV-PRIVACY", description="Statistical disclosure control, microdata anonymization, and Collection of Statistics Act provisions."),
            Competency(domain_id=domain_map["digital_governance"].id, name="Cybersecurity in Government Systems", code="GOV-CYBER", description="Data security, safe credential handling, CERT-In compliance, and secure data transmission."),
            Competency(domain_id=domain_map["digital_governance"].id, name="Digital Public Infrastructure & Government Cloud", code="GOV-CLOUD", description="MeghRaj cloud adoption, API-based interoperability, and National Data Governance Framework Policy (NDGFP)."),

            # Behavioural & Managerial
            Competency(domain_id=domain_map["behavioural_managerial"].id, name="Statistical Leadership & Team Supervision", code="MGMT-LEAD", description="Leading multi-disciplinary field and analytical teams, workload scheduling, and mentoring."),
            Competency(domain_id=domain_map["behavioural_managerial"].id, name="Clear Technical Writing & Dissemination", code="MGMT-COMM", description="Drafting statistical reports, press releases, policy briefs, and methodological notes."),
            Competency(domain_id=domain_map["behavioural_managerial"].id, name="Professional Ethics in Official Statistics", code="MGMT-ETHICS", description="UN Fundamental Principles of Official Statistics: impartiality, professional independence, transparency.")
        ]
        db.add_all(competencies)
        db.flush()
        comp_map = {c.code: c for c in competencies}

        print("Seeding Role Competency Requirements for SSO-PSD...")
        sso_role = role_map["SSO-PSD"]
        sso_reqs = [
            RoleCompetencyRequirement(job_role_id=sso_role.id, competency_id=comp_map["STAT-PRICE"].id, required_proficiency=3.5, importance="critical", weight=2.0),
            RoleCompetencyRequirement(job_role_id=sso_role.id, competency_id=comp_map["STAT-SAMPLING"].id, required_proficiency=3.0, importance="high", weight=1.5),
            RoleCompetencyRequirement(job_role_id=sso_role.id, competency_id=comp_map["STAT-DQAF"].id, required_proficiency=3.0, importance="high", weight=1.5),
            RoleCompetencyRequirement(job_role_id=sso_role.id, competency_id=comp_map["TECH-PYTHON"].id, required_proficiency=2.5, importance="medium", weight=1.2),
            RoleCompetencyRequirement(job_role_id=sso_role.id, competency_id=comp_map["TECH-SQL"].id, required_proficiency=2.5, importance="medium", weight=1.2),
            RoleCompetencyRequirement(job_role_id=sso_role.id, competency_id=comp_map["TECH-VIZ"].id, required_proficiency=2.5, importance="medium", weight=1.0),
            RoleCompetencyRequirement(job_role_id=sso_role.id, competency_id=comp_map["GOV-PRIVACY"].id, required_proficiency=3.0, importance="high", weight=1.5),
            RoleCompetencyRequirement(job_role_id=sso_role.id, competency_id=comp_map["MGMT-ETHICS"].id, required_proficiency=3.0, importance="high", weight=1.2)
        ]
        db.add_all(sso_reqs)

        # Requirements for AD-NAD
        ad_role = role_map["AD-NAD"]
        ad_reqs = [
            RoleCompetencyRequirement(job_role_id=ad_role.id, competency_id=comp_map["STAT-SNA"].id, required_proficiency=3.5, importance="critical", weight=2.0),
            RoleCompetencyRequirement(job_role_id=ad_role.id, competency_id=comp_map["STAT-PRICE"].id, required_proficiency=3.0, importance="high", weight=1.5),
            RoleCompetencyRequirement(job_role_id=ad_role.id, competency_id=comp_map["TECH-R"].id, required_proficiency=3.0, importance="high", weight=1.5),
            RoleCompetencyRequirement(job_role_id=ad_role.id, competency_id=comp_map["STAT-SDMX"].id, required_proficiency=2.5, importance="medium", weight=1.0),
            RoleCompetencyRequirement(job_role_id=ad_role.id, competency_id=comp_map["MGMT-COMM"].id, required_proficiency=3.0, importance="high", weight=1.2),
            RoleCompetencyRequirement(job_role_id=ad_role.id, competency_id=comp_map["MGMT-LEAD"].id, required_proficiency=3.0, importance="high", weight=1.2)
        ]
        db.add_all(ad_reqs)
        db.flush()

        print("Seeding Users and Profiles...")
        # 1. Learner
        learner_user = User(
            email="learner@mospi.gov.in",
            hashed_password=get_password_hash("Learner@2026"),
            full_name="Ramesh Kumar",
            role=RoleEnum.LEARNER,
            is_active=True,
            is_verified=True
        )
        db.add(learner_user)
        db.flush()

        learner_profile = OfficialProfile(
            user_id=learner_user.id,
            designation="Senior Statistical Officer",
            department_id=dept_map["MoSPI-PSD"].id,
            job_role_id=sso_role.id,
            employee_code="SSS/2019/4821",
            current_assignment="CPI (Urban) price collection supervision and monthly price outlier auditing for North Zone.",
            cadre="Subordinate Statistical Service (SSS)",
            state_posting="New Delhi",
            educational_qualifications=[
                {"degree": "M.Sc. Statistics", "institution": "University of Delhi", "year": 2018},
                {"degree": "B.Sc. (Hons) Statistics", "institution": "Banaras Hindu University", "year": 2016}
            ],
            work_experience_years=7,
            previous_trainings=[
                {"title": "Foundational Training in Official Statistics", "institute": "NSSTA", "year": 2019},
                {"title": "Consumer Price Index Compilation Protocols", "institute": "MoSPI-PSD", "year": 2021}
            ],
            learning_preferences={"formats": ["self_paced_interactive", "practical_labs"], "focus_areas": ["Python", "Automated Outlier Detection", "Sampling Weighting"]},
            preferred_language="en",
            career_objectives="Advance to Assistant Director, deepen automated data auditing capabilities, and contribute to National Accounts deflator research.",
            verified_by_manager=True
        )
        db.add(learner_profile)

        # 2. Trainer
        trainer_user = User(
            email="trainer@nssta.gov.in",
            hashed_password=get_password_hash("Trainer@2026"),
            full_name="Dr. Sunita Rao",
            role=RoleEnum.TRAINER,
            is_active=True,
            is_verified=True
        )
        db.add(trainer_user)
        db.flush()

        trainer_profile = OfficialProfile(
            user_id=trainer_user.id,
            designation="Joint Director & Training Faculty",
            department_id=dept_map["NSSTA"].id,
            job_role_id=role_map["FTC-NSSTA"].id,
            employee_code="ISS/2011/1209",
            current_assignment="Head of Data Science and Survey Methodology Faculty, NSSTA Greater Noida.",
            cadre="Indian Statistical Service (ISS)",
            state_posting="Uttar Pradesh (Greater Noida)",
            educational_qualifications=[{"degree": "Ph.D. Statistics", "institution": "ISI Kolkata", "year": 2010}],
            work_experience_years=15,
            preferred_language="en",
            verified_by_manager=True
        )
        db.add(trainer_profile)

        # 3. Manager
        manager_user = User(
            email="manager@mospi.gov.in",
            hashed_password=get_password_hash("Manager@2026"),
            full_name="Vikramaditya Sharma",
            role=RoleEnum.MANAGER,
            is_active=True,
            is_verified=True
        )
        db.add(manager_user)
        db.flush()

        manager_profile = OfficialProfile(
            user_id=manager_user.id,
            designation="Additional Director General",
            department_id=dept_map["MoSPI-PSD"].id,
            job_role_id=sso_role.id,
            employee_code="ISS/2002/0514",
            current_assignment="Overseeing National Price Indices and Field Coordination.",
            cadre="Indian Statistical Service (ISS)",
            state_posting="New Delhi",
            work_experience_years=24,
            preferred_language="en",
            verified_by_manager=True
        )
        db.add(manager_profile)

        # 4. Administrator
        admin_user = User(
            email="admin@statskill.gov.in",
            hashed_password=get_password_hash("Admin@2026"),
            full_name="StatSkill Platform Admin",
            role=RoleEnum.ADMIN,
            is_active=True,
            is_verified=True
        )
        db.add(admin_user)
        db.flush()

        admin_profile = OfficialProfile(
            user_id=admin_user.id,
            designation="Senior Systems Analyst / Platform Admin",
            department_id=dept_map["NSSTA"].id,
            job_role_id=role_map["FTC-NSSTA"].id,
            employee_code="ADM/2026/001",
            current_assignment="StatSkill AI System Administration and Integration Engineering.",
            cadre="Technical",
            state_posting="New Delhi",
            work_experience_years=10,
            preferred_language="en",
            verified_by_manager=True
        )
        db.add(admin_profile)

        print("Seeding Initial Assessed Competency Results for Ramesh Kumar...")
        # Ramesh has assessed 5 competencies so far; some have gaps, some are unassessed
        initial_results = [
            CompetencyResult(
                user_id=learner_user.id,
                competency_id=comp_map["STAT-PRICE"].id,
                assessed_proficiency=2.5,
                confidence_score=0.90,
                evidence_type="diagnostic_assessment",
                last_assessed_at=datetime.now(timezone.utc) - timedelta(days=12),
                supporting_notes="Demonstrated strong grasp of Laspeyres price indices and price quotation scrubbing, but requires deeper training on geometric mean aggregations and quality adjustments."
            ),
            CompetencyResult(
                user_id=learner_user.id,
                competency_id=comp_map["STAT-SAMPLING"].id,
                assessed_proficiency=2.0,
                confidence_score=0.85,
                evidence_type="diagnostic_assessment",
                last_assessed_at=datetime.now(timezone.utc) - timedelta(days=12),
                supporting_notes="Sound understanding of simple random sampling; needs improvement on multistage cluster sampling and design effects."
            ),
            CompetencyResult(
                user_id=learner_user.id,
                competency_id=comp_map["STAT-DQAF"].id,
                assessed_proficiency=2.5,
                confidence_score=0.88,
                evidence_type="diagnostic_assessment",
                last_assessed_at=datetime.now(timezone.utc) - timedelta(days=12),
                supporting_notes="Applies field audit checklists consistently; can improve on documentation of metadata and non-sampling error quantification."
            ),
            CompetencyResult(
                user_id=learner_user.id,
                competency_id=comp_map["TECH-PYTHON"].id,
                assessed_proficiency=1.5,
                confidence_score=0.82,
                evidence_type="diagnostic_assessment",
                last_assessed_at=datetime.now(timezone.utc) - timedelta(days=5),
                supporting_notes="Basic awareness of Python syntax; struggles with DataFrame transformations and automated CSV anomaly checking."
            ),
            CompetencyResult(
                user_id=learner_user.id,
                competency_id=comp_map["MGMT-ETHICS"].id,
                assessed_proficiency=3.0,
                confidence_score=0.95,
                evidence_type="training_completion",
                last_assessed_at=datetime.now(timezone.utc) - timedelta(days=40),
                supporting_notes="Completed NSSTA mandatory ethics module on UN Fundamental Principles of Official Statistics with distinction."
            )
            # TECH-SQL, TECH-VIZ, and GOV-PRIVACY are intentionally UNASSESSED to test the 'Assessment needed' requirement!
        ]
        db.add_all(initial_results)
        db.flush()

        print("Seeding Diagnostic Assessment with rich MCQs...")
        diag_assessment = Assessment(
            title="Diagnostic Competency Assessment: Price Statistics & Field Verification",
            description="Comprehensive competency assessment evaluated against the Senior Statistical Officer (SSO) proficiency standard.",
            job_role_id=sso_role.id,
            domain_id=domain_map["statistical"].id,
            difficulty="intermediate",
            time_limit_minutes=25,
            passing_score_pct=60.0,
            is_active=True
        )
        db.add(diag_assessment)
        db.flush()

        questions = [
            AssessmentQuestion(
                assessment_id=diag_assessment.id,
                competency_id=comp_map["STAT-PRICE"].id,
                question_text="Under the Indian Consumer Price Index (CPI) methodology, which formula is primarily adopted at the elementary aggregate level for combining individual price quotations?",
                options=[
                    "Carli index (simple arithmetic mean of price relatives)",
                    "Jevons index (geometric mean of price relatives)",
                    "Dutot index (ratio of arithmetic mean prices)",
                    "Harmonic mean of price relatives"
                ],
                correct_option_index=1,
                explanation="The Jevons index (geometric mean of price relatives) satisfies the time reversal and transitivity tests and avoids the upward bias inherent in the Carli index.",
                difficulty="intermediate",
                points=2
            ),
            AssessmentQuestion(
                assessment_id=diag_assessment.id,
                competency_id=comp_map["STAT-PRICE"].id,
                question_text="When a designated sample item in an urban market is permanently discontinued and replaced by a comparable substitute, what is the standard statistical procedure?",
                options=[
                    "Drop the item entirely and reduce the base year weight",
                    "Impute using the average price change of remaining items or apply overlap pricing",
                    "Record the price as zero for subsequent quarters",
                    "Substitute with any randomly available luxury item"
                ],
                correct_option_index=1,
                explanation="Standard price index practice (ILO/UN Consumer Price Index Manual) prescribes overlap pricing, targeted imputation based on the product subclass, or hedonics to prevent artificial index shocks.",
                difficulty="intermediate",
                points=2
            ),
            AssessmentQuestion(
                assessment_id=diag_assessment.id,
                competency_id=comp_map["STAT-SAMPLING"].id,
                question_text="In a two-stage stratified sampling scheme used by NSSO, if first-stage units (FSUs) are selected with Probability Proportional to Size (PPS), what represents the size measure typically used?",
                options=[
                    "Total agricultural land area in the district",
                    "Census population or number of households in the village / urban frame block",
                    "Number of bank accounts opened under DBT schemes",
                    "Total revenue collection of the gram panchayat"
                ],
                correct_option_index=1,
                explanation="In NSSO rounds, the population or household count from the latest Decennial Census (for rural villages) or Urban Frame Survey (UFS) blocks is utilized as the auxiliary size variable in PPS selection.",
                difficulty="intermediate",
                points=2
            ),
            AssessmentQuestion(
                assessment_id=diag_assessment.id,
                competency_id=comp_map["STAT-DQAF"].id,
                question_text="Which of the following is considered a non-sampling error that the Data Quality Assurance Framework (DQAF) requires field supervisors to systematically monitor?",
                options=[
                    "Sampling variance resulting from finite sample size",
                    "Defective frame, non-response bias, and respondent recall decay",
                    "Random binomial fluctuation in sample draws",
                    "Standard error of the sample mean"
                ],
                correct_option_index=1,
                explanation="Non-sampling errors arise from measurement defects, frame omissions, investigator bias, and non-response, distinct from mathematical sampling variability.",
                difficulty="foundational",
                points=2
            ),
            AssessmentQuestion(
                assessment_id=diag_assessment.id,
                competency_id=comp_map["TECH-PYTHON"].id,
                question_text="In pandas, which vectorized method is most appropriate to flag extreme price outliers that fall outside 3 Interquartile Ranges (IQR) from the 75th percentile for a commodity group?",
                options=[
                    "Iterating with a standard Python for-loop over iterrows()",
                    "Using df['price'].transform() combined with quantile(0.75) + 3 * (quantile(0.75) - quantile(0.25))",
                    "Writing price values to a text file and grep searching",
                    "Calling df.drop_duplicates() on the timestamp index"
                ],
                correct_option_index=1,
                explanation="Pandas transform/quantile calculations operate vectorized across commodity groups, enabling rapid statistical boundary evaluation without slow Python iterrows loops.",
                difficulty="intermediate",
                points=2
            ),
            AssessmentQuestion(
                assessment_id=diag_assessment.id,
                competency_id=comp_map["GOV-PRIVACY"].id,
                question_text="Under Section 9 of the Collection of Statistics Act, 2008, what is the mandatory obligation regarding individual operational or household level data collected by an authorized official?",
                options=[
                    "All microdata must be immediately published on public open data portals with full names and addresses",
                    "Data shall be used exclusively for statistical purposes and confidential individual details cannot be disclosed or used in court evidence",
                    "Data can be traded to commercial marketing agencies to recover administrative costs",
                    "Confidentiality rules expire after 30 days of data collection"
                ],
                correct_option_index=1,
                explanation="The Collection of Statistics Act strictly guarantees statistical confidentiality: information collected cannot be used for any purpose other than statistical analysis and cannot be published in identifiable form.",
                difficulty="foundational",
                points=2
            )
        ]
        db.add_all(questions)
        db.flush()

        print("Seeding Courses (iGOT Karmayogi & NSSTA verified)...")
        courses = [
            Course(
                title="Consumer Price Index Compilation & Modern Quality Adjustment",
                provider="iGOT Karmayogi",
                provider_course_id="IGOT-STAT-401",
                external_url="https://igotkarmayogi.gov.in/app/toc/lex_auth_013894812",
                description="Comprehensive masterclass covering Laspeyres, Jevons, geometric aggregation, seasonal item imputation, and digital price collection tools.",
                duration_hours=6.5,
                difficulty_level="intermediate",
                language="English",
                format="online_self_paced",
                thumbnail_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
                is_active=True
            ),
            Course(
                title="Python for Official Statistics: Data Cleaning & Automated Verification",
                provider="iGOT Karmayogi",
                provider_course_id="IGOT-TECH-204",
                external_url="https://igotkarmayogi.gov.in/app/toc/lex_auth_013894955",
                description="Practical, code-driven training in pandas, numpy, and matplotlib for cleaning NSSO survey returns, detecting price outliers, and generating validation logs.",
                duration_hours=8.0,
                difficulty_level="intermediate",
                language="English",
                format="online_self_paced",
                thumbnail_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
                is_active=True
            ),
            Course(
                title="Sampling Theory & Design of Large-Scale Household Surveys",
                provider="NSSTA",
                provider_course_id="NSSTA-ST-102",
                external_url="https://www.mospi.gov.in/training-calendar-nssta",
                description="Rigorous theoretical and applied foundation in stratified multi-stage designs, probability proportional to size (PPS), and multiplier estimation.",
                duration_hours=12.0,
                difficulty_level="advanced",
                language="English",
                format="online_self_paced",
                thumbnail_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
                is_active=True
            ),
            Course(
                title="SQL for Statistical Database Querying & Administrative Records",
                provider="iGOT Karmayogi",
                provider_course_id="IGOT-TECH-108",
                external_url="https://igotkarmayogi.gov.in/app/toc/lex_auth_013895012",
                description="Hands-on relational database querying, window aggregations, subqueries, and data extraction from large administrative databases.",
                duration_hours=5.0,
                difficulty_level="foundational",
                language="English",
                format="online_self_paced",
                thumbnail_url="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80",
                is_active=True
            ),
            Course(
                title="Data Confidentiality, Anonymization & Statistical Disclosure Control",
                provider="iGOT Karmayogi",
                provider_course_id="IGOT-GOV-302",
                external_url="https://igotkarmayogi.gov.in/app/toc/lex_auth_013895201",
                description="Legal frameworks (Collection of Statistics Act, DPDPA), k-anonymity, l-diversity, perturbation, and releasing safe public microdata.",
                duration_hours=4.5,
                difficulty_level="intermediate",
                language="English",
                format="online_self_paced",
                thumbnail_url="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80",
                is_active=True
            ),
            Course(
                title="Data Quality Assurance Framework (DQAF) in Official Statistics",
                provider="NSSTA",
                provider_course_id="NSSTA-QA-201",
                external_url="https://www.mospi.gov.in/data-quality-framework",
                description="Applying international and national quality dimensions to survey life cycles, administrative records, and disseminated statistical tables.",
                duration_hours=6.0,
                difficulty_level="intermediate",
                language="English",
                format="online_self_paced",
                thumbnail_url="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
                is_active=True
            )
        ]
        db.add_all(courses)
        db.flush()
        course_map = {c.provider_course_id: c for c in courses}

        print("Seeding Course-to-Competency Mappings...")
        mappings = [
            CourseCompetencyMapping(course_id=course_map["IGOT-STAT-401"].id, competency_id=comp_map["STAT-PRICE"].id, target_proficiency=3.5, coverage_weight=1.0),
            CourseCompetencyMapping(course_id=course_map["IGOT-TECH-204"].id, competency_id=comp_map["TECH-PYTHON"].id, target_proficiency=3.0, coverage_weight=1.0),
            CourseCompetencyMapping(course_id=course_map["IGOT-TECH-204"].id, competency_id=comp_map["STAT-PRICE"].id, target_proficiency=2.5, coverage_weight=0.6),
            CourseCompetencyMapping(course_id=course_map["NSSTA-ST-102"].id, competency_id=comp_map["STAT-SAMPLING"].id, target_proficiency=3.5, coverage_weight=1.0),
            CourseCompetencyMapping(course_id=course_map["IGOT-TECH-108"].id, competency_id=comp_map["TECH-SQL"].id, target_proficiency=3.0, coverage_weight=1.0),
            CourseCompetencyMapping(course_id=course_map["IGOT-GOV-302"].id, competency_id=comp_map["GOV-PRIVACY"].id, target_proficiency=3.0, coverage_weight=1.0),
            CourseCompetencyMapping(course_id=course_map["NSSTA-QA-201"].id, competency_id=comp_map["STAT-DQAF"].id, target_proficiency=3.5, coverage_weight=1.0)
        ]
        db.add_all(mappings)

        print("Seeding Verified NSSTA TPAC-Recommended Training Programmes...")
        nssta_programmes = [
            NSSTATrainingProgramme(
                title="Advanced Workshop on Price Statistics, Index Theory & Scanner Data",
                source_organization="National Statistical Systems Training Academy (NSSTA), Greater Noida",
                tpac_approval_status="verified_recommended",
                tpac_reference_number="TPAC/NSSTA/2026/04-PS",
                competencies_covered=["STAT-PRICE", "STAT-DQAF", "TECH-PYTHON"],
                target_job_roles=["SSO-PSD", "AD-NAD"],
                eligibility_criteria="SSOs, JSOs, and ISS Officers with minimum 2 years of experience in price or industrial statistics.",
                prerequisites="Familiarity with base year price indices and basic spreadsheet manipulation.",
                duration_days=5,
                delivery_format="residential_at_nssta",
                schedule_dates=[
                    {"batch": 1, "start": "2026-11-16", "end": "2026-11-20", "venue": "NSSTA Campus, Plot 22, Knowledge Park II, Greater Noida"},
                    {"batch": 2, "start": "2027-01-18", "end": "2027-01-22", "venue": "NSSTA Campus, Greater Noida"}
                ],
                official_url="https://www.mospi.gov.in/nssta-training-programmes",
                source_reference="NSSTA Annual Training Calendar 2026-27, Page 14, Item 22",
                last_verified_date=datetime.now(timezone.utc)
            ),
            NSSTATrainingProgramme(
                title="Hands-On Python & Modern Data Engineering for Official Statistics",
                source_organization="National Statistical Systems Training Academy (NSSTA), Greater Noida",
                tpac_approval_status="verified_recommended",
                tpac_reference_number="TPAC/NSSTA/2026/09-PY",
                competencies_covered=["TECH-PYTHON", "TECH-SQL", "STAT-DQAF"],
                target_job_roles=["SSO-PSD", "AD-NAD", "SDA-ESD", "FOS-FOD"],
                eligibility_criteria="All statistical officers seeking computer-aided audit and automated data curation skills.",
                prerequisites="Basic computer literacy; no prior coding experience required.",
                duration_days=10,
                delivery_format="residential_at_nssta",
                schedule_dates=[
                    {"batch": 1, "start": "2026-12-07", "end": "2026-12-18", "venue": "Computer Lab 1, NSSTA Greater Noida"}
                ],
                official_url="https://www.mospi.gov.in/nssta-python-lab",
                source_reference="TPAC Recommendation Minutes dated 12-Aug-2026",
                last_verified_date=datetime.now(timezone.utc)
            ),
            NSSTATrainingProgramme(
                title="Management of Non-Sampling Errors and Field Verification Protocols",
                source_organization="National Statistical Systems Training Academy (NSSTA), Greater Noida",
                tpac_approval_status="verified_recommended",
                tpac_reference_number="TPAC/NSSTA/2026/12-FOD",
                competencies_covered=["STAT-SAMPLING", "STAT-DQAF", "MGMT-LEAD"],
                target_job_roles=["FOS-FOD", "SSO-PSD"],
                eligibility_criteria="Field supervisors and divisional officers of FOD and State Directorates of Economics & Statistics.",
                prerequisites="Field experience in at least one socio-economic or agricultural survey round.",
                duration_days=5,
                delivery_format="hybrid",
                schedule_dates=[
                    {"batch": 1, "start": "2026-11-23", "end": "2026-11-27", "venue": "Virtual Classroom + Regional Field Lab"}
                ],
                official_url="https://www.mospi.gov.in/nssta-field-protocols",
                source_reference="NSSTA TPAC Approved Schedule 2026-27",
                last_verified_date=datetime.now(timezone.utc)
            )
        ]
        db.add_all(nssta_programmes)
        db.flush()

        print("Seeding Personalized Learning Path for Ramesh Kumar...")
        lp = LearningPath(
            user_id=learner_user.id,
            title="Competency Acceleration: Price Statistics & Automated Verification",
            description="Targeted 4-module progression designed to close high-priority gaps in Price Statistics, Python Automation, and Data Quality.",
            target_job_role_id=sso_role.id,
            total_modules=4,
            estimated_hours=21.0,
            is_active=True
        )
        db.add(lp)
        db.flush()

        modules = [
            LearningPathModule(
                learning_path_id=lp.id,
                title="Module 1: Advanced Price Index Compilation & Modern Quality Adjustment",
                description="Covers geometric aggregation, substitution imputation, and price outlier analysis.",
                order_index=1,
                competency_id=comp_map["STAT-PRICE"].id,
                course_id=course_map["IGOT-STAT-401"].id,
                is_mandatory=True,
                estimated_hours=6.5
            ),
            LearningPathModule(
                learning_path_id=lp.id,
                title="Module 2: Practical Python for Survey Microdata & Automated Checks",
                description="Hands-on data cleaning and outlier detection using pandas.",
                order_index=2,
                competency_id=comp_map["TECH-PYTHON"].id,
                course_id=course_map["IGOT-TECH-204"].id,
                is_mandatory=True,
                estimated_hours=8.0
            ),
            LearningPathModule(
                learning_path_id=lp.id,
                title="Module 3: NSSTA Residential Workshop on Scanner Data & Price Statistics",
                description="TPAC recommended in-person intensive workshop at NSSTA Greater Noida.",
                order_index=3,
                competency_id=comp_map["STAT-PRICE"].id,
                nssta_programme_id=nssta_programmes[0].id,
                is_mandatory=False,
                estimated_hours=25.0
            ),
            LearningPathModule(
                learning_path_id=lp.id,
                title="Module 4: Data Quality Assurance Framework (DQAF) Implementation",
                description="Operationalizing quality dimensions in regional data audits.",
                order_index=4,
                competency_id=comp_map["STAT-DQAF"].id,
                course_id=course_map["NSSTA-QA-201"].id,
                is_mandatory=True,
                estimated_hours=6.0
            )
        ]
        db.add_all(modules)
        db.flush()

        # Seed progress for Module 1 (in progress)
        user_prog = UserLearningProgress(
            user_id=learner_user.id,
            learning_path_id=lp.id,
            module_id=modules[0].id,
            course_id=course_map["IGOT-STAT-401"].id,
            status="in_progress",
            progress_pct=60.0,
            time_spent_minutes=240,
            notes="Completed Units 1 & 2 on Jevons elementary index calculation."
        )
        db.add(user_prog)

        print("Seeding System Integration Settings...")
        integrations = [
            IntegrationSetting(
                service_name="igot_karmayogi",
                is_enabled=True,
                is_demo_mode=True,
                status="healthy",
                config_data={
                    "api_endpoint": "https://api.igotkarmayogi.gov.in/v1",
                    "auth_mode": "Bearer Token / mTLS ready",
                    "sync_interval_hours": 24,
                    "supported_payloads": ["course_catalog", "user_enrollment", "completion_certificates"]
                },
                last_sync_at=datetime.now(timezone.utc) - timedelta(hours=3)
            ),
            IntegrationSetting(
                service_name="nssta_api",
                is_enabled=True,
                is_demo_mode=True,
                status="healthy",
                config_data={
                    "api_endpoint": "https://www.mospi.gov.in/api/nssta/v1",
                    "tpac_verification_channel": "active",
                    "batch_schedule_sync": "weekly"
                },
                last_sync_at=datetime.now(timezone.utc) - timedelta(hours=5)
            ),
            IntegrationSetting(
                service_name="parichay_sso",
                is_enabled=False,
                is_demo_mode=True,
                status="demo_mode",
                config_data={
                    "sso_type": "OAuth2 / OIDC Parichay NIC",
                    "client_id": "STATSKILL_GOV_PROD_01",
                    "status_note": "Awaiting final NIC production credential allocation. Local mock adapter enabled."
                }
            )
        ]
        db.add_all(integrations)

        # Sync log
        sync_log = SyncLog(
            service_name="igot_karmayogi",
            sync_type="course_catalog",
            records_synced=6,
            status="success",
            details={"message": "Retrieved 6 active certified courses for statistical official track.", "latency_ms": 340},
            started_at=datetime.now(timezone.utc) - timedelta(hours=3),
            completed_at=datetime.now(timezone.utc) - timedelta(hours=3) + timedelta(seconds=2)
        )
        db.add(sync_log)

        # Welcome notification
        notif = Notification(
            user_id=learner_user.id,
            title="Skill Gap Analysis Updated",
            message="Your competency assessment results for Price Statistics have identified priority learning recommendations. Review your personalized learning path.",
            category="recommendation",
            is_read=False,
            action_url="/skill-gaps"
        )
        db.add(notif)

        db.commit()
        print("SEEDING COMPLETED SUCCESSFULLY!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
